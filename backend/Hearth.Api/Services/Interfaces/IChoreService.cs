using Hearth.Api.DTOs;

namespace Hearth.Api.Services;

public interface IChoreService
{
    Task<IEnumerable<ChoreResponse>> GetChoresAsync(int userId);

    Task<ChoreResponse?> GetChoreAsync(int userId, int id);

    Task<ChoreResponse> CreateChoreAsync(int userId, CreateChoreRequest request);

    Task<ChoreResponse?> UpdateChoreAsync(int userId, int id, UpdateChoreRequest request);

    Task<ChoreResponse?> DeleteChoreAsync(int userId, int id);
}
