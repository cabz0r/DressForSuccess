import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

// --- Types ---
export interface Volunteer { id: number; firstName: string; lastName: string; email: string; phone: string; createdAt: string }
export interface Client { id: number; firstName: string; lastName: string; email: string; phone: string; address: string; referralAgency: number; notes: string }
export interface Booking {
  id: number; clientId: number; volunteerId?: number; appointmentDate: string
  status: string; serviceType: string; notes: string; createdAt: string
  completedAt?: string; cancellationReason?: string; outcomeNotes?: string
  client: Client; volunteer?: Volunteer
}
export interface Product { id: number; name: string; description: string; price: number; category: string; size: string; imageUrl: string; stockQuantity: number }
export interface ReferralOption { value: number; label: string }

// --- Auth ---
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })
export const register = (data: object) => api.post('/auth/register', data)

// --- Clients ---
export const getClients = () => api.get<Client[]>('/clients')
export const createClient = (data: object) => api.post<Client>('/clients', data)
export const getReferralAgencies = () => api.get<ReferralOption[]>('/clients/referral-agencies')

// --- Bookings ---
export const getBookings = () => api.get<Booking[]>('/bookings')
export const createBooking = (data: object) => api.post<Booking>('/bookings', data)
export const getVolunteerBookings = (id: number) => api.get<Booking[]>(`/bookings/volunteer/${id}`)
export const assignVolunteer = (bookingId: number, volunteerId: number) =>
  api.patch(`/bookings/${bookingId}/assign-volunteer`, { volunteerId })
export const completeBooking = (id: number, outcomeNotes: string) =>
  api.patch(`/bookings/${id}/complete`, { outcomeNotes })
export const cancelBooking = (id: number, cancellationReason: string) =>
  api.patch(`/bookings/${id}/cancel`, { cancellationReason })

// --- Volunteers ---
export const getVolunteers = () => api.get<Volunteer[]>('/volunteers')
export const getVolunteer = (id: number) => api.get(`/volunteers/${id}`)

// --- Products ---
export const getProducts = (category?: string) =>
  api.get<Product[]>('/products', { params: category ? { category } : {} })
export const getCategories = () => api.get<string[]>('/products/categories')

// --- Chat ---
export const sendChat = (message: string, history: { role: string; content: string }[]) =>
  api.post<{ reply: string }>('/chat', { message, history })

// --- Notifications ---
export interface AppNotification {
  id: number; volunteerId?: number; clientId?: number; bookingId?: number
  type: string; event: string; recipient: string; subject: string; body: string
  isRead: boolean; isSent: boolean; sentAt: string; createdAt: string
}
export const getVolunteerNotifications = (volunteerId: number) =>
  api.get<AppNotification[]>(`/notifications/volunteer/${volunteerId}`)
export const getUnreadCount = (volunteerId: number) =>
  api.get<{ count: number }>(`/notifications/unread-count/${volunteerId}`)
export const markNotificationRead = (id: number) =>
  api.patch(`/notifications/${id}/read`)
export const markAllRead = (volunteerId: number) =>
  api.patch(`/notifications/read-all/${volunteerId}`)

// --- Insights ---
export interface InsightsData {
  summary: { totalClients: number; totalBookings: number; totalVolunteers: number; completedBookings: number; cancelledBookings: number; completionRate: number; cancellationRate: number }
  statusBreakdown: { status: string; count: number }[]
  referralBreakdown: { agency: string; count: number }[]
  referralByCompleted: { agency: string; completedBookings: number }[]
  monthlyTrends: { month: string; count: number }[]
  serviceBreakdown: { service: string; count: number }[]
  volunteerStats: { volunteerId: number; totalBookings: number; completed: number; cancelled: number }[]
}
export const getInsights = () => api.get<InsightsData>('/insights')

