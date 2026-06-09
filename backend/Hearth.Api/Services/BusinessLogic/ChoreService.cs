using Hearth.Api.Data;
using Hearth.Api.DTOs;
using Hearth.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Services;

public class ChoreService : IChoreService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly ILogger<ChoreService> _logger;

    public ChoreService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IEmailService emailService,
        ILogger<ChoreService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<IEnumerable<ChoreResponse>> GetChoresAsync(int userId)
    {
        var chores = await _context.Chores
            .Include(chore => chore.AssignedToMember)
            .Where(chore => chore.UserId == userId)
            .OrderBy(chore => chore.DueDate)
            .ToListAsync();

        return chores.Select(ToResponse);
    }

    public async Task<ChoreResponse?> GetChoreAsync(int userId, int id)
    {
        var chore = await _context.Chores
            .Include(chore => chore.AssignedToMember)
            .FirstOrDefaultAsync(chore => chore.Id == id && chore.UserId == userId);

        return chore is null ? null : ToResponse(chore);
    }

    public async Task<ChoreResponse> CreateChoreAsync(int userId, CreateChoreRequest request)
    {
        var assignedMember = await GetAssignedMemberAsync(userId, request.AssignedToMemberId);
        var dueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Utc);

        var chore = new Chore
        {
            UserId = userId,
            Title = request.Title,
            AssignedToMemberId = assignedMember?.Id,
            AssignedToMember = assignedMember,
            AssignedTo = assignedMember?.FullName ?? string.Empty,
            AssignedUserEmail = assignedMember?.Email,
            Category = request.Category,
            DueDate = dueDate,
            IsCompleted = request.IsCompleted,
            CreatedDate = DateTime.UtcNow
        };

        _context.Chores.Add(chore);
        await _context.SaveChangesAsync();

        await NotifyAssignedMemberAsync(chore, assignedMember);

        return ToResponse(chore);
    }

    public async Task<ChoreResponse?> UpdateChoreAsync(int userId, int id, UpdateChoreRequest request)
    {
        var chore = await _context.Chores
            .Include(existingChore => existingChore.AssignedToMember)
            .FirstOrDefaultAsync(existingChore => existingChore.Id == id && existingChore.UserId == userId);

        if (chore is null)
        {
            return null;
        }

        var previousAssignedMemberId = chore.AssignedToMemberId;
        var assignedMember = await GetAssignedMemberAsync(userId, request.AssignedToMemberId);

        chore.Title = request.Title;
        chore.AssignedToMemberId = assignedMember?.Id;
        chore.AssignedToMember = assignedMember;
        chore.AssignedTo = assignedMember?.FullName ?? string.Empty;
        chore.AssignedUserEmail = assignedMember?.Email;
        chore.Category = request.Category;
        chore.DueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Utc);
        chore.IsCompleted = request.IsCompleted;
        chore.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        if (assignedMember is not null && previousAssignedMemberId != assignedMember.Id)
        {
            await NotifyAssignedMemberAsync(chore, assignedMember);
        }

        return ToResponse(chore);
    }

    public async Task<ChoreResponse?> DeleteChoreAsync(int userId, int id)
    {
        var chore = await _context.Chores
            .Include(existingChore => existingChore.AssignedToMember)
            .FirstOrDefaultAsync(existingChore => existingChore.Id == id && existingChore.UserId == userId);

        if (chore is null)
        {
            return null;
        }

        var response = ToResponse(chore);
        _context.Chores.Remove(chore);
        await _context.SaveChangesAsync();

        return response;
    }

    private async Task<HouseholdMember?> GetAssignedMemberAsync(int userId, int? assignedToMemberId)
    {
        if (assignedToMemberId is null)
        {
            return null;
        }

        var assignedMember = await _context.HouseholdMembers
            .FirstOrDefaultAsync(member => member.Id == assignedToMemberId && member.UserId == userId);

        if (assignedMember is null)
        {
            throw new ArgumentException("Assigned household member does not exist.");
        }

        return assignedMember;
    }

    private async Task NotifyAssignedMemberAsync(Chore chore, HouseholdMember? assignedMember)
    {
        if (assignedMember is null)
        {
            return;
        }

        var assignedUser = await _context.Users
            .FirstOrDefaultAsync(user => user.Email == assignedMember.Email);

        if (assignedUser is not null)
        {
            try
            {
                await _notificationService.CreateNotificationAsync(
                    assignedUser.Id,
                    "New Chore Assigned",
                    $"You have been assigned a new chore: {chore.Title}",
                    "ChoreAssigned");
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to create chore assignment notification for {Email}", assignedMember.Email);
            }
        }

        if (!string.IsNullOrWhiteSpace(assignedMember.Email))
        {
            try
            {
                await _emailService.SendEmailAsync(
                    assignedMember.Email,
                    "New Chore Assigned",
                    $"You have been assigned the chore:\n{chore.Title}\n\nDue Date:\n{chore.DueDate:MMMM d, yyyy}");
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to send chore assignment email to {Email}", assignedMember.Email);
                Console.WriteLine(exception.ToString());
            }
        }
    }

    private static ChoreResponse ToResponse(Chore chore)
    {
        return new ChoreResponse
        {
            Id = chore.Id,
            UserId = chore.UserId,
            Title = chore.Title,
            AssignedToMemberId = chore.AssignedToMemberId,
            AssignedMemberName = chore.AssignedToMember?.FullName,
            AssignedMemberEmail = chore.AssignedToMember?.Email,
            Category = chore.Category,
            DueDate = chore.DueDate,
            IsCompleted = chore.IsCompleted,
            CreatedDate = chore.CreatedDate
        };
    }
}
