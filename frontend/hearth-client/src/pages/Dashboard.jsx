import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FiBell,
  FiChevronDown,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiHome,
  FiLogOut,
  FiMoon,
  FiPieChart,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiSun,
  FiUsers,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import ActivityFeed from '../components/ui/ActivityFeed'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import PriorityCard from '../components/ui/PriorityCard'
import QuickActionCard from '../components/ui/QuickActionCard'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../context/useAuth'
import AppLayout from '../layouts/AppLayout'
import BillsService from '../services/BillsService'
import ChoresService from '../services/ChoresService'
import MealsService from '../services/MealsService'
import RemindersService from '../services/RemindersService'
import ShoppingService from '../services/ShoppingService'

const initialBillForm = {
  title: '',
  amount: '',
  dueDate: '',
  category: '',
  isPaid: false,
}

const initialReminderForm = {
  title: '',
  reminderDate: '',
  category: '',
  isCompleted: false,
}

const initialMealForm = {
  mealName: '',
  mealType: 'Breakfast',
  plannedDate: '',
}

const initialShoppingForm = {
  itemName: '',
  category: 'Grocery',
  quantity: '',
  isPurchased: false,
}

const initialChoreForm = {
  title: '',
  assignedTo: '',
  category: 'Cleaning',
  dueDate: '',
  isCompleted: false,
}

const tabs = [
  { icon: FiHome, label: 'Overview', path: '/dashboard' },
  { icon: FiDollarSign, label: 'Bills', path: '/bills' },
  { icon: FiBell, label: 'Reminders', path: '/reminders' },
  { icon: FiPieChart, label: 'Meals', path: '/meals' },
  { icon: FiShoppingBag, label: 'Shopping', path: '/shopping' },
  { icon: FiUsers, label: 'Chores', path: '/chores' },
]

const pagePaths = {
  Bills: '/bills',
  Chores: '/chores',
  Meals: '/meals',
  Overview: '/dashboard',
  Reminders: '/reminders',
  Shopping: '/shopping',
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

function formatDate(date) {
  if (!date) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function isWithinNextWeek(date) {
  if (!date) {
    return false
  }

  const itemDate = new Date(date)
  const today = new Date()
  const nextWeek = new Date()
  today.setHours(0, 0, 0, 0)
  nextWeek.setDate(today.getDate() + 7)

  return itemDate >= today && itemDate <= nextWeek
}

function isPastDue(date) {
  if (!date) {
    return false
  }

  const itemDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return itemDate < today
}

function sortByDate(items, dateField) {
  return [...items].sort((first, second) => new Date(first[dateField]) - new Date(second[dateField]))
}

function Dashboard({ page = 'Overview' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('hearth_theme') === 'dark')
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('hearth_compact_mode') === 'true')
  const [animationsEnabled, setAnimationsEnabled] = useState(() => localStorage.getItem('hearth_animations_enabled') !== 'false')
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const savedSettings = localStorage.getItem('hearth_notification_settings')

    if (savedSettings) {
      return JSON.parse(savedSettings)
    }

    return {
      billReminders: true,
      choreReminders: true,
      dailySummary: true,
      shoppingReminders: false,
    }
  })
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [bills, setBills] = useState([])
  const [reminders, setReminders] = useState([])
  const [meals, setMeals] = useState([])
  const [shoppingItems, setShoppingItems] = useState([])
  const [chores, setChores] = useState([])
  const [billForm, setBillForm] = useState(initialBillForm)
  const [reminderForm, setReminderForm] = useState(initialReminderForm)
  const [mealForm, setMealForm] = useState(initialMealForm)
  const [shoppingForm, setShoppingForm] = useState(initialShoppingForm)
  const [choreForm, setChoreForm] = useState(initialChoreForm)
  const [isLoadingBills, setIsLoadingBills] = useState(true)
  const [isLoadingReminders, setIsLoadingReminders] = useState(true)
  const [isLoadingMeals, setIsLoadingMeals] = useState(true)
  const [isLoadingShopping, setIsLoadingShopping] = useState(true)
  const [isLoadingChores, setIsLoadingChores] = useState(true)
  const [isSubmittingBill, setIsSubmittingBill] = useState(false)
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false)
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false)
  const [isSubmittingShopping, setIsSubmittingShopping] = useState(false)
  const [isSubmittingChore, setIsSubmittingChore] = useState(false)
  const [billsError, setBillsError] = useState('')
  const [remindersError, setRemindersError] = useState('')
  const [mealsError, setMealsError] = useState('')
  const [shoppingError, setShoppingError] = useState('')
  const [choresError, setChoresError] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem('hearth_theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    document.documentElement.dataset.compact = compactMode ? 'true' : 'false'
    localStorage.setItem('hearth_compact_mode', String(compactMode))
  }, [compactMode])

  useEffect(() => {
    document.documentElement.dataset.animations = animationsEnabled ? 'true' : 'false'
    localStorage.setItem('hearth_animations_enabled', String(animationsEnabled))
  }, [animationsEnabled])

  useEffect(() => {
    localStorage.setItem('hearth_notification_settings', JSON.stringify(notificationSettings))
  }, [notificationSettings])

  const totalBills = bills.length
  const paidBills = bills.filter((bill) => bill.isPaid).length
  const unpaidBills = totalBills - paidBills
  const totalMonthlyAmount = bills.reduce((total, bill) => total + Number(bill.amount), 0)
  const totalReminders = reminders.length
  const pendingReminders = reminders.filter((reminder) => !reminder.isCompleted).length
  const totalMeals = meals.length
  const totalShoppingItems = shoppingItems.length
  const purchasedItems = shoppingItems.filter((item) => item.isPurchased).length
  const pendingShoppingItems = totalShoppingItems - purchasedItems
  const totalChores = chores.length
  const completedChores = chores.filter((chore) => chore.isCompleted).length
  const pendingChores = totalChores - completedChores
  const upcomingBills = sortByDate(
    bills.filter((bill) => !bill.isPaid),
    'dueDate',
  ).slice(0, 5)
  const pendingReminderList = sortByDate(
    reminders.filter((reminder) => !reminder.isCompleted),
    'reminderDate',
  ).slice(0, 5)
  const mealsThisWeek = sortByDate(
    meals.filter((meal) => isWithinNextWeek(meal.plannedDate)),
    'plannedDate',
  ).slice(0, 5)
  const pendingShoppingList = shoppingItems.filter((item) => !item.isPurchased).slice(0, 5)
  const pendingChoreList = sortByDate(
    chores.filter((chore) => !chore.isCompleted),
    'dueDate',
  ).slice(0, 5)
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const userInitials = (user?.fullName || user?.email || 'Hearth User')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
  const memberSince = 'Member since 2026'
  const getPercentage = (completed, total) => (total === 0 ? 0 : Math.round((completed / total) * 100))
  const billsCompletion = getPercentage(paidBills, totalBills)
  const choresCompletion = getPercentage(completedChores, totalChores)
  const remindersCompletion = getPercentage(totalReminders - pendingReminders, totalReminders)
  const shoppingCompletion = getPercentage(purchasedItems, totalShoppingItems)
  const healthMetrics = [
    {
      icon: FiDollarSign,
      label: 'Bills Completion',
      value: billsCompletion,
      description: `${paidBills} of ${totalBills} bills handled`,
    },
    {
      icon: FiUsers,
      label: 'Chore Completion',
      value: choresCompletion,
      description: `${completedChores} of ${totalChores} chores complete`,
    },
    {
      icon: FiBell,
      label: 'Reminder Completion',
      value: remindersCompletion,
      description: `${pendingReminders} reminders still open`,
    },
    {
      icon: FiShoppingBag,
      label: 'Shopping Completion',
      value: shoppingCompletion,
      description: `${pendingShoppingItems} items left to buy`,
    },
  ]
  const overviewStats = [
    {
      accent: '#7C5CFC',
      chartValue: billsCompletion,
      description: `${unpaidBills} unpaid · ${formatCurrency(totalMonthlyAmount)}`,
      icon: FiDollarSign,
      label: 'Bills',
      trend: '+12% organized',
      value: totalBills,
    },
    {
      accent: '#F59E0B',
      chartValue: remindersCompletion,
      description: 'Open home follow-ups',
      icon: FiBell,
      label: 'Reminders',
      trend: `${remindersCompletion}% complete`,
      value: pendingReminders,
    },
    {
      accent: '#EC4899',
      chartValue: 72,
      description: 'Meals planned ahead',
      icon: FiPieChart,
      label: 'Meals',
      trend: `${mealsThisWeek.length} this week`,
      value: totalMeals,
    },
    {
      accent: '#F59E0B',
      chartValue: shoppingCompletion,
      description: 'Items still to buy',
      icon: FiShoppingBag,
      label: 'Shopping',
      trend: `${shoppingCompletion}% purchased`,
      value: pendingShoppingItems,
    },
    {
      accent: '#10B981',
      chartValue: choresCompletion,
      description: 'Household work queue',
      icon: FiUsers,
      label: 'Chores',
      trend: `${choresCompletion}% complete`,
      value: pendingChores,
    },
  ]
  const todaysPriorities = [
    ...upcomingBills.map((bill) => ({
      badge: isPastDue(bill.dueDate) ? 'Overdue bill' : 'Upcoming bill',
      dueDate: formatDate(bill.dueDate),
      icon: FiDollarSign,
      label: bill.title,
      meta: formatCurrency(bill.amount),
      priority: isPastDue(bill.dueDate) ? 0 : 1,
      tab: 'Bills',
      tone: isPastDue(bill.dueDate) ? 'danger' : 'warning',
    })),
    ...pendingReminderList.map((reminder) => ({
      badge: 'Reminder',
      dueDate: formatDate(reminder.reminderDate),
      icon: FiBell,
      label: reminder.title,
      meta: reminder.category,
      priority: 2,
      tab: 'Reminders',
      tone: 'info',
    })),
    ...pendingChoreList.map((chore) => ({
      badge: isPastDue(chore.dueDate) ? 'Overdue chore' : 'Pending chore',
      dueDate: formatDate(chore.dueDate),
      icon: FiUsers,
      label: chore.title,
      meta: chore.assignedTo,
      priority: isPastDue(chore.dueDate) ? 1 : 3,
      tab: 'Chores',
      tone: isPastDue(chore.dueDate) ? 'danger' : 'success',
    })),
    ...pendingShoppingList.map((item) => ({
      badge: 'Shopping',
      dueDate: 'Pending',
      icon: FiShoppingBag,
      label: item.itemName,
      meta: `${item.category} · Qty ${item.quantity}`,
      priority: 4,
      tab: 'Shopping',
      tone: 'accent',
    })),
  ].sort((first, second) => first.priority - second.priority).slice(0, 8)
  const recentActivity = [
    ...bills.slice(-2).map((bill) => ({
      icon: FiDollarSign,
      title: 'Bill added',
      detail: bill.title,
      time: 'Recent',
    })),
    ...reminders.slice(-2).map((reminder) => ({
      icon: FiBell,
      title: 'Reminder added',
      detail: reminder.title,
      time: 'Recent',
    })),
    ...chores.filter((chore) => chore.isCompleted).slice(-2).map((chore) => ({
      icon: FiCheckCircle,
      title: 'Chore completed',
      detail: chore.title,
      time: 'Recent',
    })),
    ...shoppingItems.filter((item) => item.isPurchased).slice(-2).map((item) => ({
      icon: FiShoppingBag,
      title: 'Shopping item purchased',
      detail: item.itemName,
      time: 'Recent',
    })),
  ].slice(-6)
  const visibleActivity = recentActivity.length > 0 ? recentActivity : [
    {
      icon: FiDollarSign,
      title: 'Bill added',
      detail: 'Internet bill is ready to track',
      time: 'Sample',
    },
    {
      icon: FiBell,
      title: 'Created reminder',
      detail: 'HVAC filter follow-up',
      time: 'Sample',
    },
    {
      icon: FiCheckCircle,
      title: 'Completed chore',
      detail: 'Kitchen reset',
      time: 'Sample',
    },
  ]

  const loadBills = async () => {
    setBillsError('')
    setIsLoadingBills(true)

    try {
      const response = await BillsService.getBills()
      setBills(response.data)
    } catch (error) {
      console.error(error.response?.data || error.message)
      setBillsError('Could not load bills. Please make sure you are logged in.')
    } finally {
      setIsLoadingBills(false)
    }
  }

  const loadReminders = async () => {
    setRemindersError('')
    setIsLoadingReminders(true)

    try {
      const response = await RemindersService.getReminders()
      setReminders(response.data)
    } catch (error) {
      console.error(error.response?.data || error.message)
      setRemindersError('Could not load reminders. Please try again.')
    } finally {
      setIsLoadingReminders(false)
    }
  }

  const loadMeals = async () => {
    setMealsError('')
    setIsLoadingMeals(true)

    try {
      const response = await MealsService.getMeals()
      setMeals(response.data)
    } catch (error) {
      console.error(error.response?.data || error.message)
      setMealsError('Could not load meals. Please try again.')
    } finally {
      setIsLoadingMeals(false)
    }
  }

  const loadShoppingItems = async () => {
    setShoppingError('')
    setIsLoadingShopping(true)

    try {
      const response = await ShoppingService.getShoppingItems()
      setShoppingItems(response.data)
    } catch (error) {
      console.error(error.response?.data || error.message)
      setShoppingError('Could not load shopping items. Please try again.')
    } finally {
      setIsLoadingShopping(false)
    }
  }

  const loadChores = async () => {
    setChoresError('')
    setIsLoadingChores(true)

    try {
      const response = await ChoresService.getChores()
      setChores(response.data)
    } catch (error) {
      console.error(error.response?.data || error.message)
      setChoresError('Could not load chores. Please try again.')
    } finally {
      setIsLoadingChores(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const [billsResponse, remindersResponse, mealsResponse, shoppingResponse, choresResponse] = await Promise.all([
          BillsService.getBills(),
          RemindersService.getReminders(),
          MealsService.getMeals(),
          ShoppingService.getShoppingItems(),
          ChoresService.getChores(),
        ])

        if (isMounted) {
          setBills(billsResponse.data)
          setReminders(remindersResponse.data)
          setMeals(mealsResponse.data)
          setShoppingItems(shoppingResponse.data)
          setChores(choresResponse.data)
        }
      } catch (error) {
        console.error(error.response?.data || error.message)

        if (isMounted) {
          setBillsError('Could not load dashboard data. Please make sure you are logged in.')
          setRemindersError('Could not load dashboard data. Please try again.')
          setMealsError('Could not load dashboard data. Please try again.')
          setShoppingError('Could not load dashboard data. Please try again.')
          setChoresError('Could not load dashboard data. Please try again.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingBills(false)
          setIsLoadingReminders(false)
          setIsLoadingMeals(false)
          setIsLoadingShopping(false)
          setIsLoadingChores(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNotificationSettingChange = (settingName) => {
    setNotificationSettings({
      ...notificationSettings,
      [settingName]: !notificationSettings[settingName],
    })
  }

  const handleBillFormChange = (event) => {
    const { name, value, checked, type } = event.target

    setBillForm({
      ...billForm,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleReminderFormChange = (event) => {
    const { name, value, checked, type } = event.target

    setReminderForm({
      ...reminderForm,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleMealFormChange = (event) => {
    const { name, value } = event.target

    setMealForm({
      ...mealForm,
      [name]: value,
    })
  }

  const handleShoppingFormChange = (event) => {
    const { name, value, checked, type } = event.target

    setShoppingForm({
      ...shoppingForm,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleChoreFormChange = (event) => {
    const { name, value, checked, type } = event.target

    setChoreForm({
      ...choreForm,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleCreateBill = async (event) => {
    event.preventDefault()
    setBillsError('')
    setIsSubmittingBill(true)

    const newBill = {
      title: billForm.title,
      amount: Number(billForm.amount),
      dueDate: billForm.dueDate,
      category: billForm.category,
      isPaid: billForm.isPaid,
    }

    try {
      await BillsService.createBill(newBill)
      setBillForm(initialBillForm)
      await loadBills()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setBillsError('Could not create bill. Please check the form and try again.')
    } finally {
      setIsSubmittingBill(false)
    }
  }

  const handleCreateReminder = async (event) => {
    event.preventDefault()
    setRemindersError('')
    setIsSubmittingReminder(true)

    const newReminder = {
      title: reminderForm.title,
      reminderDate: reminderForm.reminderDate,
      category: reminderForm.category,
      isCompleted: reminderForm.isCompleted,
    }

    try {
      await RemindersService.createReminder(newReminder)
      setReminderForm(initialReminderForm)
      await loadReminders()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setRemindersError('Could not create reminder. Please check the form and try again.')
    } finally {
      setIsSubmittingReminder(false)
    }
  }

  const handleCreateMeal = async (event) => {
    event.preventDefault()
    setMealsError('')
    setIsSubmittingMeal(true)

    const newMeal = {
      mealName: mealForm.mealName,
      mealType: mealForm.mealType,
      plannedDate: mealForm.plannedDate,
    }

    try {
      await MealsService.createMeal(newMeal)
      setMealForm(initialMealForm)
      await loadMeals()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setMealsError('Could not create meal. Please check the form and try again.')
    } finally {
      setIsSubmittingMeal(false)
    }
  }

  const handleCreateShoppingItem = async (event) => {
    event.preventDefault()
    setShoppingError('')
    setIsSubmittingShopping(true)

    const newShoppingItem = {
      itemName: shoppingForm.itemName,
      category: shoppingForm.category,
      quantity: Number(shoppingForm.quantity),
      isPurchased: shoppingForm.isPurchased,
    }

    try {
      await ShoppingService.createShoppingItem(newShoppingItem)
      setShoppingForm(initialShoppingForm)
      await loadShoppingItems()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setShoppingError('Could not create shopping item. Please check the form and try again.')
    } finally {
      setIsSubmittingShopping(false)
    }
  }

  const handleCreateChore = async (event) => {
    event.preventDefault()
    setChoresError('')
    setIsSubmittingChore(true)

    const newChore = {
      title: choreForm.title,
      assignedTo: choreForm.assignedTo,
      category: choreForm.category,
      dueDate: choreForm.dueDate,
      isCompleted: choreForm.isCompleted,
    }

    try {
      await ChoresService.createChore(newChore)
      setChoreForm(initialChoreForm)
      await loadChores()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setChoresError('Could not create chore. Please check the form and try again.')
    } finally {
      setIsSubmittingChore(false)
    }
  }

  const handleDeleteBill = async (id) => {
    setBillsError('')

    try {
      await BillsService.deleteBill(id)
      await loadBills()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setBillsError('Could not delete bill. Please try again.')
    }
  }

  const handleDeleteReminder = async (id) => {
    setRemindersError('')

    try {
      await RemindersService.deleteReminder(id)
      await loadReminders()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setRemindersError('Could not delete reminder. Please try again.')
    }
  }

  const handleDeleteMeal = async (id) => {
    setMealsError('')

    try {
      await MealsService.deleteMeal(id)
      await loadMeals()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setMealsError('Could not delete meal. Please try again.')
    }
  }

  const handleDeleteShoppingItem = async (id) => {
    setShoppingError('')

    try {
      await ShoppingService.deleteShoppingItem(id)
      await loadShoppingItems()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setShoppingError('Could not delete shopping item. Please try again.')
    }
  }

  const handleDeleteChore = async (id) => {
    setChoresError('')

    try {
      await ChoresService.deleteChore(id)
      await loadChores()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setChoresError('Could not delete chore. Please try again.')
    }
  }

  const handleTogglePaid = async (bill) => {
    setBillsError('')

    const updatedBill = {
      ...bill,
      isPaid: !bill.isPaid,
    }

    try {
      await BillsService.updateBill(bill.id, updatedBill)
      await loadBills()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setBillsError('Could not update bill status. Please try again.')
    }
  }

  const handleToggleCompleted = async (reminder) => {
    setRemindersError('')

    const updatedReminder = {
      ...reminder,
      isCompleted: !reminder.isCompleted,
    }

    try {
      await RemindersService.updateReminder(reminder.id, updatedReminder)
      await loadReminders()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setRemindersError('Could not update reminder status. Please try again.')
    }
  }

  const handleTogglePurchased = async (item) => {
    setShoppingError('')

    const updatedItem = {
      ...item,
      isPurchased: !item.isPurchased,
    }

    try {
      await ShoppingService.updateShoppingItem(item.id, updatedItem)
      await loadShoppingItems()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setShoppingError('Could not update shopping item status. Please try again.')
    }
  }

  const handleToggleChoreCompleted = async (chore) => {
    setChoresError('')

    const updatedChore = {
      ...chore,
      isCompleted: !chore.isCompleted,
    }

    try {
      await ChoresService.updateChore(chore.id, updatedChore)
      await loadChores()
    } catch (error) {
      console.error(error.response?.data || error.message)
      setChoresError('Could not update chore status. Please try again.')
    }
  }

  const renderShoppingSummaryCards = () => (
    <section className="summary-grid shopping-summary" aria-label="Shopping summary">
      <StatCard accent="#7C5CFC" icon={FiShoppingBag} label="Total Items" value={totalShoppingItems} />
      <StatCard accent="#10B981" icon={FiCheckCircle} label="Purchased Items" value={purchasedItems} />
      <StatCard accent="#F59E0B" icon={FiClock} label="Pending Items" value={pendingShoppingItems} />
    </section>
  )

  const renderChoresSummaryCards = () => (
    <section className="summary-grid shopping-summary" aria-label="Chores summary">
      <StatCard accent="#7C5CFC" icon={FiUsers} label="Total Chores" value={totalChores} />
      <StatCard accent="#10B981" icon={FiCheckCircle} label="Completed Chores" value={completedChores} />
      <StatCard accent="#F59E0B" icon={FiClock} label="Pending Chores" value={pendingChores} />
    </section>
  )

  return (
    <AppLayout>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-mark small">H</span>
            <div>
              <strong>Hearth</strong>
              <span>Household command center</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Dashboard sections">
            <div className="nav-group">
              <span>Overview</span>
              {[tabs[0]].map((tab) => (
                <button
                  className={page === tab.label ? 'nav-item active' : 'nav-item'}
                  key={tab.label}
                  type="button"
                  onClick={() => navigate(tab.path)}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="nav-group">
              <span>Management</span>
              {tabs.slice(1, 3).map((tab) => (
                <button
                  className={page === tab.label ? 'nav-item active' : 'nav-item'}
                  key={tab.label}
                  type="button"
                  onClick={() => navigate(tab.path)}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="nav-group">
              <span>Household</span>
              {tabs.slice(3).map((tab) => (
                <button
                  className={page === tab.label ? 'nav-item active' : 'nav-item'}
                  key={tab.label}
                  type="button"
                  onClick={() => navigate(tab.path)}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="nav-group account-group">
            <span>Account</span>
            <button className={page === 'Settings' ? 'nav-item active' : 'nav-item'} type="button" onClick={() => navigate('/settings')}>
              <FiSettings />
              Settings
            </button>
            <button className="sidebar-logout" type="button" onClick={handleLogout}>
              <FiLogOut />
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="top-header">
            <div className="header-search">
              <FiSearch />
              <input aria-label="Search Hearth" placeholder="Search bills, chores, meals..." type="search" />
            </div>
            <button className="notification-button" type="button" aria-label="Notifications">
              <FiBell />
              <span>{todaysPriorities.length}</span>
            </button>
            <div className="user-menu">
              <button className="header-profile" type="button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <span>{firstName.slice(0, 1).toUpperCase()}</span>
                <div className="profile-text">
                  <strong>{firstName}</strong>
                  <small>{user?.email}</small>
                </div>
                <FiChevronDown />
              </button>
              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <strong>{user?.fullName || firstName}</strong>
                  <small>{user?.email}</small>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
            <button className="theme-toggle" type="button" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <FiSun /> : <FiMoon />}
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
          </header>

          <AnimatePresence mode="wait">
          {page === 'Overview' && (
            <motion.section className="tab-panel" key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <section className="welcome-hero">
                <div className="hero-content">
                  <h2>Welcome Home, {firstName}</h2>
                  <p>{today}</p>
                  <strong>You have {todaysPriorities.length} priorities requiring attention today.</strong>
                  <div className="hero-insights" aria-label="Home summary">
                    <span>{unpaidBills} unpaid {unpaidBills === 1 ? 'bill' : 'bills'}</span>
                    <span>{pendingChores} pending {pendingChores === 1 ? 'chore' : 'chores'}</span>
                    <span>{pendingReminders} {pendingReminders === 1 ? 'reminder' : 'reminders'}</span>
                  </div>
                </div>
                {/* <div className="hero-priority-badge">
                  <span>{todaysPriorities.length}</span>
                  <p>priorities today</p>
                </div> */}
              </section>

              <section className="overview-stat-grid" aria-label="Household modules">
                {overviewStats.map((stat) => {
                  const isPrimaryMetric = ['Bills', 'Reminders', 'Chores'].includes(stat.label)

                  return (
                    <StatCard
                      accent={stat.accent}
                      chartValue={stat.chartValue}
                      className={isPrimaryMetric ? 'primary-kpi' : 'secondary-kpi'}
                      description={stat.description}
                      icon={stat.icon}
                      key={stat.label}
                      label={stat.label}
                      trend={stat.trend}
                      value={stat.value}
                    />
                  )
                })}
              </section>

              <div className="main-grid overview-focus-grid">
                <section className="list-card priorities-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Today's priorities</h3>
                      <p>Upcoming and pending items that need attention first.</p>
                    </div>
                    <span>{todaysPriorities.length} items</span>
                  </div>
                  {todaysPriorities.length === 0 ? (
                    <EmptyState compact icon={FiClock}>Nothing urgent today.</EmptyState>
                  ) : (
                    <div className="compact-list">
                      {todaysPriorities.map((item, index) => (
                        <PriorityCard
                          isFeatured={index === 0}
                          item={item}
                          key={`${item.tab}-${item.label}`}
                          onClick={() => navigate(pagePaths[item.tab])}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="list-card quick-actions-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Quick actions</h3>
                      <p>Create common household records fast.</p>
                    </div>
                  </div>
                  <div className="quick-actions-grid">
                    <QuickActionCard accent="#7C5CFC" icon={FiDollarSign} label="Add Bill" onClick={() => navigate('/bills')} />
                    <QuickActionCard accent="#3B82F6" icon={FiBell} label="Add Reminder" onClick={() => navigate('/reminders')} />
                    <QuickActionCard accent="#10B981" icon={FiUsers} label="Add Chore" onClick={() => navigate('/chores')} />
                    <QuickActionCard accent="#EC4899" icon={FiShoppingBag} label="Add Shopping Item" onClick={() => navigate('/shopping')} />
                  </div>
                </section>
              </div>

              <div className="overview-secondary-grid">
                <section className="list-card activity-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Recent activity</h3>
                      <p>A timeline of the latest household changes.</p>
                    </div>
                  </div>
                  <ActivityFeed emptyIcon={FiClock} items={visibleActivity} />
                </section>

                <section className="list-card household-health-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Household health</h3>
                      <p>Compact completion view across the household.</p>
                    </div>
                  </div>
                  <div className="health-metrics">
                    {healthMetrics.map((metric) => (
                      <article className="health-row radial-health-row" key={metric.label}>
                        <div className="health-ring" style={{ '--health-value': `${metric.value}%` }}>
                          <span><metric.icon /></span>
                        </div>
                        <div>
                          <strong>{metric.label}</strong>
                          <small>{metric.description}</small>
                        </div>
                        <b>{metric.value}%</b>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </motion.section>
          )}

          {page === 'Bills' && (
            <motion.section className="tab-panel module-grid" key="bills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <form className="form-card compact-form" onSubmit={handleCreateBill}>
                <div>
                  <p className="section-label">Bills</p>
                  <h2>Create Bill</h2>
                </div>
                <div className="form-grid">
                  <label className="form-field" htmlFor="title">
                    <span>Title</span>
                    <input id="title" name="title" value={billForm.title} onChange={handleBillFormChange} required />
                  </label>
                  <label className="form-field" htmlFor="amount">
                    <span>Amount</span>
                    <input id="amount" name="amount" type="number" min="0" step="0.01" value={billForm.amount} onChange={handleBillFormChange} required />
                  </label>
                  <label className="form-field" htmlFor="dueDate">
                    <span>Due Date</span>
                    <input id="dueDate" name="dueDate" type="date" value={billForm.dueDate} onChange={handleBillFormChange} required />
                  </label>
                  <label className="form-field" htmlFor="category">
                    <span>Category</span>
                    <input id="category" name="category" value={billForm.category} onChange={handleBillFormChange} required />
                  </label>
                </div>
                <label className="checkbox-field" htmlFor="isPaid">
                  <input id="isPaid" name="isPaid" type="checkbox" checked={billForm.isPaid} onChange={handleBillFormChange} />
                  <span>Mark as paid</span>
                </label>
                <button className="primary-button" type="submit" disabled={isSubmittingBill}>
                  {isSubmittingBill ? 'Creating...' : 'Create Bill'}
                </button>
              </form>

              <section className="list-card module-list-card">
                <div className="list-card-header">
                  <div>
                    <h3>Household bills</h3>
                    <p>Track due dates, categories, and payment status.</p>
                  </div>
                  <span>{totalBills} total</span>
                </div>
                {billsError && <div className="form-alert">{billsError}</div>}
                {isLoadingBills ? (
                  <LoadingSpinner label="Loading bills..." />
                ) : bills.length === 0 ? (
                  <EmptyState icon={FiDollarSign}>No bills yet. Add your first bill to get started.</EmptyState>
                ) : (
                  <div className="data-list">
                    {bills.map((bill) => (
                      <article className="data-row bill-row" key={bill.id}>
                        <div className="row-main">
                          <h4>{bill.title}</h4>
                          <p>
                            {bill.category} · Due {formatDate(bill.dueDate)}
                          </p>
                        </div>
                        <strong className="amount">{formatCurrency(bill.amount)}</strong>
                        <StatusBadge tone={bill.isPaid ? 'paid' : 'unpaid'}>
                          {bill.isPaid ? 'Paid' : 'Unpaid'}
                        </StatusBadge>
                        <div className="row-actions">
                          <button className="ghost-button" type="button" onClick={() => handleTogglePaid(bill)}>
                            {bill.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDeleteBill(bill.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </motion.section>
          )}

          {page === 'Reminders' && (
            <motion.section className="tab-panel module-grid" key="reminders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <form className="form-card compact-form" onSubmit={handleCreateReminder}>
                <div>
                  <p className="section-label">Reminders</p>
                  <h2>Create Reminder</h2>
                </div>
                <div className="form-grid">
                  <label className="form-field" htmlFor="reminderTitle">
                    <span>Title</span>
                    <input id="reminderTitle" name="title" value={reminderForm.title} onChange={handleReminderFormChange} required />
                  </label>
                  <label className="form-field" htmlFor="reminderDate">
                    <span>Reminder Date</span>
                    <input id="reminderDate" name="reminderDate" type="date" value={reminderForm.reminderDate} onChange={handleReminderFormChange} required />
                  </label>
                  <label className="form-field" htmlFor="reminderCategory">
                    <span>Category</span>
                    <input id="reminderCategory" name="category" value={reminderForm.category} onChange={handleReminderFormChange} required />
                  </label>
                </div>
                <label className="checkbox-field" htmlFor="isCompleted">
                  <input id="isCompleted" name="isCompleted" type="checkbox" checked={reminderForm.isCompleted} onChange={handleReminderFormChange} />
                  <span>Mark as completed</span>
                </label>
                <button className="primary-button" type="submit" disabled={isSubmittingReminder}>
                  {isSubmittingReminder ? 'Creating...' : 'Create Reminder'}
                </button>
              </form>

              <section className="list-card module-list-card">
                <div className="list-card-header">
                  <div>
                    <h3>Home reminders</h3>
                    <p>Keep household follow-ups visible and manageable.</p>
                  </div>
                  <span>{totalReminders} total</span>
                </div>
                {remindersError && <div className="form-alert">{remindersError}</div>}
                {isLoadingReminders ? (
                  <p className="empty-state">Loading reminders...</p>
                ) : reminders.length === 0 ? (
                  <p className="empty-state">No reminders yet. Add your first reminder to get started.</p>
                ) : (
                  <div className="data-list">
                    {reminders.map((reminder) => (
                      <article className="data-row" key={reminder.id}>
                        <div className="row-main">
                          <h4>{reminder.title}</h4>
                          <p>
                            {reminder.category} · {formatDate(reminder.reminderDate)}
                          </p>
                        </div>
                        <span className={reminder.isCompleted ? 'status paid' : 'status unpaid'}>
                          {reminder.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                        <div className="row-actions">
                          <button className="ghost-button" type="button" onClick={() => handleToggleCompleted(reminder)}>
                            {reminder.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDeleteReminder(reminder.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </motion.section>
          )}

          {page === 'Meals' && (
            <motion.section className="tab-panel module-grid" key="meals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <form className="form-card compact-form" onSubmit={handleCreateMeal}>
                <div>
                  <p className="section-label">Meals</p>
                  <h2>Create Meal</h2>
                </div>
                <div className="form-grid">
                  <label className="form-field" htmlFor="mealName">
                    <span>Meal Name</span>
                    <input id="mealName" name="mealName" value={mealForm.mealName} onChange={handleMealFormChange} required />
                  </label>
                  <label className="form-field" htmlFor="mealType">
                    <span>Meal Type</span>
                    <select id="mealType" name="mealType" value={mealForm.mealType} onChange={handleMealFormChange} required>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </label>
                  <label className="form-field" htmlFor="plannedDate">
                    <span>Planned Date</span>
                    <input id="plannedDate" name="plannedDate" type="date" value={mealForm.plannedDate} onChange={handleMealFormChange} required />
                  </label>
                </div>
                <button className="primary-button" type="submit" disabled={isSubmittingMeal}>
                  {isSubmittingMeal ? 'Creating...' : 'Create Meal'}
                </button>
              </form>

              <section className="list-card module-list-card">
                <div className="list-card-header">
                  <div>
                    <h3>Meal planner</h3>
                    <p>Plan meals without cluttering the rest of the dashboard.</p>
                  </div>
                  <span>{totalMeals} total</span>
                </div>
                {mealsError && <div className="form-alert">{mealsError}</div>}
                {isLoadingMeals ? (
                  <p className="empty-state">Loading meals...</p>
                ) : meals.length === 0 ? (
                  <p className="empty-state">No meals yet. Add your first planned meal to get started.</p>
                ) : (
                  <div className="data-list">
                    {meals.map((meal) => (
                      <article className="data-row" key={meal.id}>
                        <div className="row-main">
                          <h4>{meal.mealName}</h4>
                          <p>{formatDate(meal.plannedDate)}</p>
                        </div>
                        <span className="status meal-type">{meal.mealType}</span>
                        <div className="row-actions">
                          <button className="danger-button" type="button" onClick={() => handleDeleteMeal(meal.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </motion.section>
          )}

          {page === 'Shopping' && (
            <motion.section className="tab-panel module-grid shopping-panel" key="shopping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <div className="shopping-stack">
                {renderShoppingSummaryCards()}
                <form className="form-card compact-form" onSubmit={handleCreateShoppingItem}>
                  <div>
                    <p className="section-label">Shopping</p>
                    <h2>Create Shopping Item</h2>
                  </div>
                  <div className="form-grid">
                    <label className="form-field" htmlFor="itemName">
                      <span>Item Name</span>
                      <input id="itemName" name="itemName" value={shoppingForm.itemName} onChange={handleShoppingFormChange} required />
                    </label>
                    <label className="form-field" htmlFor="shoppingCategory">
                      <span>Category</span>
                      <select id="shoppingCategory" name="category" value={shoppingForm.category} onChange={handleShoppingFormChange} required>
                        <option value="Grocery">Grocery</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Home">Home</option>
                        <option value="Pet">Pet</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="form-field" htmlFor="quantity">
                      <span>Quantity</span>
                      <input id="quantity" name="quantity" type="number" min="1" value={shoppingForm.quantity} onChange={handleShoppingFormChange} required />
                    </label>
                  </div>
                  <label className="checkbox-field" htmlFor="isPurchased">
                    <input id="isPurchased" name="isPurchased" type="checkbox" checked={shoppingForm.isPurchased} onChange={handleShoppingFormChange} />
                    <span>Mark as purchased</span>
                  </label>
                  <button className="primary-button" type="submit" disabled={isSubmittingShopping}>
                    {isSubmittingShopping ? 'Creating...' : 'Create Item'}
                  </button>
                </form>
              </div>

              <section className="list-card module-list-card">
                <div className="list-card-header">
                  <div>
                    <h3>Shopping list</h3>
                    <p>Keep groceries and home supplies organized.</p>
                  </div>
                  <span>{totalShoppingItems} total</span>
                </div>
                {shoppingError && <div className="form-alert">{shoppingError}</div>}
                {isLoadingShopping ? (
                  <p className="empty-state">Loading shopping items...</p>
                ) : shoppingItems.length === 0 ? (
                  <p className="empty-state">No shopping items yet. Add your first item to get started.</p>
                ) : (
                  <div className="data-list">
                    {shoppingItems.map((item) => (
                      <article className="data-row" key={item.id}>
                        <div className="row-main">
                          <h4>{item.itemName}</h4>
                          <p>
                            {item.category} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className={item.isPurchased ? 'status paid' : 'status unpaid'}>
                          {item.isPurchased ? 'Purchased' : 'Pending'}
                        </span>
                        <div className="row-actions">
                          <button className="ghost-button" type="button" onClick={() => handleTogglePurchased(item)}>
                            {item.isPurchased ? 'Mark Pending' : 'Mark Purchased'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDeleteShoppingItem(item.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </motion.section>
          )}

          {page === 'Chores' && (
            <motion.section className="tab-panel module-grid shopping-panel" key="chores" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <div className="shopping-stack">
                {renderChoresSummaryCards()}
                <form className="form-card compact-form" onSubmit={handleCreateChore}>
                  <div>
                    <p className="section-label">Chores</p>
                    <h2>Create Chore</h2>
                  </div>
                  <div className="form-grid">
                    <label className="form-field" htmlFor="choreTitle">
                      <span>Title</span>
                      <input id="choreTitle" name="title" value={choreForm.title} onChange={handleChoreFormChange} required />
                    </label>
                    <label className="form-field" htmlFor="assignedTo">
                      <span>Assigned To</span>
                      <input id="assignedTo" name="assignedTo" value={choreForm.assignedTo} onChange={handleChoreFormChange} required />
                    </label>
                    <label className="form-field" htmlFor="choreCategory">
                      <span>Category</span>
                      <select id="choreCategory" name="category" value={choreForm.category} onChange={handleChoreFormChange} required>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Kitchen">Kitchen</option>
                        <option value="Laundry">Laundry</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Plants">Plants</option>
                        <option value="Pets">Pets</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="form-field" htmlFor="choreDueDate">
                      <span>Due Date</span>
                      <input id="choreDueDate" name="dueDate" type="date" value={choreForm.dueDate} onChange={handleChoreFormChange} required />
                    </label>
                  </div>
                  <label className="checkbox-field" htmlFor="choreIsCompleted">
                    <input id="choreIsCompleted" name="isCompleted" type="checkbox" checked={choreForm.isCompleted} onChange={handleChoreFormChange} />
                    <span>Mark as completed</span>
                  </label>
                  <button className="primary-button" type="submit" disabled={isSubmittingChore}>
                    {isSubmittingChore ? 'Creating...' : 'Create Chore'}
                  </button>
                </form>
              </div>

              <section className="list-card module-list-card">
                <div className="list-card-header">
                  <div>
                    <h3>Chores list</h3>
                    <p>Assign household work and track completion.</p>
                  </div>
                  <span>{totalChores} total</span>
                </div>
                {choresError && <div className="form-alert">{choresError}</div>}
                {isLoadingChores ? (
                  <p className="empty-state">Loading chores...</p>
                ) : chores.length === 0 ? (
                  <p className="empty-state">No chores yet. Add your first chore to get started.</p>
                ) : (
                  <div className="data-list">
                    {chores.map((chore) => (
                      <article className="data-row" key={chore.id}>
                        <div className="row-main">
                          <h4>{chore.title}</h4>
                          <p>
                            {chore.assignedTo} · {chore.category} · Due {formatDate(chore.dueDate)}
                          </p>
                        </div>
                        <span className={chore.isCompleted ? 'status paid' : 'status unpaid'}>
                          {chore.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                        <div className="row-actions">
                          <button className="ghost-button" type="button" onClick={() => handleToggleChoreCompleted(chore)}>
                            {chore.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDeleteChore(chore.id)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </motion.section>
          )}

          {page === 'Settings' && (
            <motion.section className="tab-panel settings-panel" key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <section className="settings-hero list-card">
                <div className="list-card-header">
                  <div>
                    <p className="section-label">Account</p>
                    <h3>Settings & Profile</h3>
                    <p>Manage your Hearth workspace preferences and account session.</p>
                  </div>
                </div>
              </section>

              <div className="settings-layout">
                <section className="settings-profile-card list-card">
                  <div className="settings-avatar">{userInitials}</div>
                  <div>
                    <p className="section-label">Profile</p>
                    <h3>{user?.fullName || firstName}</h3>
                    <p>{user?.email}</p>
                    <span>{memberSince}</span>
                  </div>
                </section>

                <section className="list-card settings-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Preferences</h3>
                      <p>Personalize how Hearth feels while you work.</p>
                    </div>
                  </div>
                  <div className="settings-grid">
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Theme</strong>
                        <small>{isDarkMode ? 'Premium dark mode is active.' : 'Clean light mode is active.'}</small>
                      </span>
                      <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                    </label>
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Compact mode</strong>
                        <small>Reduce spacing for a denser household command center.</small>
                      </span>
                      <input type="checkbox" checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
                    </label>
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Animations</strong>
                        <small>Enable subtle motion and interaction feedback.</small>
                      </span>
                      <input type="checkbox" checked={animationsEnabled} onChange={() => setAnimationsEnabled(!animationsEnabled)} />
                    </label>
                  </div>
                </section>

                <section className="list-card settings-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Notification settings</h3>
                      <p>Choose which household moments Hearth should surface.</p>
                    </div>
                  </div>
                  <div className="settings-grid">
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Bill reminders</strong>
                        <small>Get nudges before unpaid bills are due.</small>
                      </span>
                      <input type="checkbox" checked={notificationSettings.billReminders} onChange={() => handleNotificationSettingChange('billReminders')} />
                    </label>
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Chore reminders</strong>
                        <small>Keep household assignments visible.</small>
                      </span>
                      <input type="checkbox" checked={notificationSettings.choreReminders} onChange={() => handleNotificationSettingChange('choreReminders')} />
                    </label>
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Shopping reminders</strong>
                        <small>Remember pending shopping list items.</small>
                      </span>
                      <input type="checkbox" checked={notificationSettings.shoppingReminders} onChange={() => handleNotificationSettingChange('shoppingReminders')} />
                    </label>
                    <label className="settings-toggle-row">
                      <span>
                        <strong>Daily summary</strong>
                        <small>Receive a calm overview of today at home.</small>
                      </span>
                      <input type="checkbox" checked={notificationSettings.dailySummary} onChange={() => handleNotificationSettingChange('dailySummary')} />
                    </label>
                  </div>
                </section>

                <section className="list-card settings-card account-card">
                  <div className="list-card-header">
                    <div>
                      <h3>Account</h3>
                      <p>Session controls and future account management.</p>
                    </div>
                  </div>
                  <div className="settings-actions">
                    <button className="danger-button" type="button" onClick={handleLogout}>
                      Logout
                    </button>
                    <button className="disabled-button" type="button" disabled>
                      Delete account
                    </button>
                  </div>
                </section>
              </div>
            </motion.section>
          )}
          </AnimatePresence>
        </main>
      </div>
    </AppLayout>
  )
}

export default Dashboard
