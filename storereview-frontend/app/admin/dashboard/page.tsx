


  // Place this after API_BASE and fetchRatings are defined
  // Example revive/restore handler for ratings
"use client"

import React, { useState, useEffect } from "react"
import { storage } from "@/lib/api"

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
  status: string;
  rating?: number | null;
}

interface Store {
  id: number;
  name: string;
  owner?: string;
  email?: string;
  address: string;
  rating?: number;
  reviews?: number;
  status: string;
  category?: string;
  phone?: string;
  description?: string;
  image?: string;
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Store, Star, Plus, Search, Edit, Trash2, Eye, LogOut, ChevronUp, ChevronDown } from "lucide-react"

export default function AdminDashboard() {
  // Check admin access on mount
  useEffect(() => {
    const user = storage.getUser();
    if (!user || user.role !== "admin") {
      window.location.href = "/";
    }
  }, []);
  const [activeTab, setActiveTab] = useState("overview")
  // Helper for API base URL (adjust if needed)
  // Use a static API_BASE to avoid hydration mismatch between SSR and client
  const API_BASE = "http://localhost:3001";
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilters, setUserFilters] = useState({ role: "all", status: "all" })
  const [storeFilters, setStoreFilters] = useState({ category: "all", status: "all" })
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false)
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    address?: string;
    role?: string;
    status?: string;
    storeName?: string;
    storeEmail?: string;
    description?: string;
    api?: string;
  }
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const [userSort, setUserSort] = useState({ field: null, direction: null })
  const [storeSort, setStoreSort] = useState({ field: null, direction: null })
  const [ratingSort, setRatingSort] = useState({ field: null, direction: null })

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "", // Added address field
    role: "normal_user",
    status: "active",
  })

  const [storeForm, setStoreForm] = useState<{
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    category: string;
    owner: string;
    status: string;
    image: string;
  }>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    category: "",
    owner: "",
    status: "active",
    image: "",
  })

  const stats = {
    totalUsers: 1250,
    totalStores: 89,
    totalRatings: 3420,
    avgRating: 4.2,
  }

  const [users, setUsers] = useState<User[]>([])

  const [stores, setStores] = useState<Store[]>([])
  // Fetch users and stores from backend
  useEffect(() => {
    const token = storage.getToken();
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
          console.log('Fetched users:', data.users);
        } else {
          const err = await res.text();
          console.error('Error fetching users:', err);
        }
      } catch (e) {
        console.error('Fetch users exception:', e);
      }
    };
    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Add sample images if missing
          // Assign images based on store name keywords
          function getImageForStore(name: string) {
            const lower = name.toLowerCase();
            if (lower.includes("book")) return "/cozy-bookstore.png";
            if (lower.includes("italian") || lower.includes("restaurant") || lower.includes("food")) return "/cozy-italian-restaurant.png";
            if (lower.includes("electronic")) return "/electronics-store-interior.png";
            if (lower.includes("fashion") || lower.includes("boutique")) return "/fashion-store-boutique.png";
            return "/placeholder-logo.png";
          }
          const storesWithImages = (data.stores || []).map((store: Store) => ({
            ...store,
            image: store.image || getImageForStore(store.name || ""),
          }));
          setStores(storesWithImages);
          console.log('Fetched stores:', storesWithImages);
        } else {
          const err = await res.text();
          console.error('Error fetching stores:', err);
        }
      } catch (e) {
        console.error('Fetch stores exception:', e);
      }
    };
    fetchUsers();
    fetchStores();
  }, []);

  // Helper to refresh users
  const refreshUsers = async () => {
    const token = storage.getToken();
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        console.log('Users after refresh:', data.users);
      }
    } catch (err) {
      console.error('Error refreshing users:', err);
    }
  };
  // Helper to refresh stores
  const refreshStores = async () => {
    const token = storage.getToken();
    try {
      const res = await fetch(`${API_BASE}/api/stores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores || []);
      }
    } catch {}
  };


  type Rating = {
    id: number;
    user: string;
    store: string;
    rating: number;
    comment: string;
    date: string;
  };
  const [ratings, setRatings] = useState<Rating[]>([])

  // Fetch ratings from backend
  const fetchRatings = async () => {
    const token = storage.getToken && storage.getToken();
    try {
      const res = await fetch(`${API_BASE}/api/ratings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setRatings(data.ratings || []);
      } else {
        setRatings([]);
      }
    } catch (err) {
      setRatings([]);
      console.error('Error fetching ratings:', err);
    }
  };

  useEffect(() => {
    fetchRatings();
    // Auto-refresh every 30 seconds to show latest ratings
    const interval = setInterval(() => {
      fetchRatings();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Function to refresh all data when needed
  const refreshAllData = async () => {
    await Promise.all([
      refreshUsers(),
      refreshStores(), 
      fetchRatings()
    ]);
  };

  const validateName = (name: string) => {
    if (name.length < 20) return "Name must be at least 20 characters long"
    if (name.length > 60) return "Name must not exceed 60 characters"
    return ""
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return ""
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (password.length > 16) return "Password must not exceed 16 characters"
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must include at least one special character"
    return ""
  }

  const validateAddress = (address: string) => {
    if (address.length > 400) return "Address must not exceed 400 characters"
    return ""
  }

  const handleAddUser = async () => {
    const newErrors: any = {}

    const nameError = validateName(userForm.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(userForm.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(userForm.password)
    if (passwordError) newErrors.password = passwordError

    const addressError = validateAddress(userForm.address)
    if (addressError) newErrors.address = addressError

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setFormErrors({})
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormErrors({ api: data.message || 'Failed to add user' });
        console.error('User registration failed:', data);
        return;
      }
      // Wait a moment to ensure DB commit, then refresh users
      await new Promise(res => setTimeout(res, 200));
      await refreshUsers();
      setUserForm({ name: "", email: "", password: "", address: "", role: "normal_user", status: "active" })
      setSearchTerm("");
      setUserFilters({ role: "all", status: "all" });
      setIsAddUserOpen(false);
    } catch (err) {
      setFormErrors({ api: 'Network error' });
      console.error('User registration network error:', err);
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({ ...user, password: "" })
    setFormErrors({})
    setIsEditUserOpen(true)
  }

  const handleUpdateUser = () => {
    const newErrors: any = {}

    const nameError = validateName(userForm.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(userForm.email)
    if (emailError) newErrors.email = emailError

    if (userForm.password && userForm.password.length > 0) {
      const passwordError = validatePassword(userForm.password)
      if (passwordError) newErrors.password = passwordError
    }

    const addressError = validateAddress(userForm.address)
    if (addressError) newErrors.address = addressError

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setFormErrors({})
  if (!editingUser) return;
  setUsers(users.map((user: User) => (user.id === editingUser.id ? { ...user, ...userForm } : user)))
    setEditingUser(null)
    setUserForm({ name: "", email: "", password: "", address: "", role: "normal_user", status: "active" })
    setIsEditUserOpen(false)
  }

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handleAddStore = async () => {
    const newErrors: any = {}

    const nameError = validateName(storeForm.name)
    if (nameError) newErrors.storeName = nameError

    const addressError = validateAddress(storeForm.address)
    if (addressError) newErrors.address = addressError

    if (storeForm.email && storeForm.email.length > 0) {
      const emailError = validateEmail(storeForm.email)
      if (emailError) newErrors.storeEmail = emailError
    }

    if (!storeForm.description || storeForm.description.length === 0) {
      newErrors.description = "Description is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setFormErrors({})
    try {
      const token = storage.getToken();
      const res = await fetch(`${API_BASE}/api/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormErrors({ api: data.message || 'Failed to add store' });
        console.error('Store creation failed:', data);
        return;
      }
      setStoreForm({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        category: "",
        owner: "",
        status: "active",
        image: "",
      })
      setIsAddStoreOpen(false)
      await refreshStores();
    } catch (err) {
      setFormErrors({ api: 'Network error' });
      console.error('Store creation network error:', err);
    }
  }

  const handleEditStore = (store: Store) => {
    setEditingStore(store)
    setStoreForm({
      name: store.name || "",
      description: store.description || "",
      address: store.address || "",
      phone: store.phone || "",
      email: store.email || "",
      category: store.category || "",
      owner: store.owner || "",
      status: store.status || "active",
      image: store.image || "",
    })
    setFormErrors({})
    setIsEditStoreOpen(true)
  }

  const handleUpdateStore = () => {
    const newErrors: any = {}

    const nameError = validateName(storeForm.name)
    if (nameError) newErrors.storeName = nameError

    const addressError = validateAddress(storeForm.address)
    if (addressError) newErrors.address = addressError

    if (storeForm.email && storeForm.email.length > 0) {
      const emailError = validateEmail(storeForm.email)
      if (emailError) newErrors.storeEmail = emailError
    }

    if (!storeForm.description || storeForm.description.length === 0) {
      newErrors.description = "Description is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setFormErrors({})
  if (!editingStore) return;
  setStores(stores.map((store: Store) => (store.id === editingStore.id ? { ...store, ...storeForm } : store)))
    setEditingStore(null)
    setStoreForm({
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      category: "",
      owner: "",
      status: "active",
      image: "",
    })
    setIsEditStoreOpen(false)
  }

  const handleDeleteStore = (storeId: number) => {
    setStores(stores.filter((store) => store.id !== storeId))
  }


  const handleDeleteRating = async (ratingId: number) => {
    // Optionally call backend to delete rating here
    // await fetch(`${API_BASE}/api/ratings/${ratingId}`, { method: 'DELETE', headers: ... })
    // After deletion, refresh ratings
    await fetchRatings();
  }

  // If you have a revive/restore/undo handler for ratings, call fetchRatings() after that action as well
  // Example:
  // const handleReviveRating = async (ratingId: number) => {
  //   await fetch(`${API_BASE}/api/ratings/${ratingId}/revive`, { method: 'POST', headers: ... })
  //   await fetchRatings();
  // }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // Clear any stored authentication data
      localStorage.removeItem("userRole")
      localStorage.removeItem("userId")
      localStorage.removeItem("authToken")

      // Redirect to login page
      window.location.href = "/"
    }
  }

  const handleSort = (field: string, currentSort: any, setSortState: any) => {
    let newDirection = "asc"

    if (currentSort.field === field) {
      if (currentSort.direction === "asc") {
        newDirection = "desc"
      } else if (currentSort.direction === "desc") {
        newDirection = ""
        field = ""
      }
    }

    setSortState({ field, direction: newDirection })
  }

  const sortData = (data: any[], sortConfig: any) => {
    if (!sortConfig.field || !sortConfig.direction) return data

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.field]
      let bValue = b[sortConfig.field]

      // Handle different data types
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (typeof aValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }

  const SortIndicator = ({ field, currentSort }: { field: string, currentSort: any }) => {
    if (currentSort.field !== field) {
      return <div className="w-4 h-4" />
    }

    return currentSort.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = userFilters.role === "all" || user.role === userFilters.role
    const matchesStatus = userFilters.status === "all" || user.status === userFilters.status

    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      (store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (store.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (store.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (store.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesCategory = storeFilters.category === "all" || store.category === storeFilters.category
    const matchesStatus = storeFilters.status === "all" || store.status === storeFilters.status

    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedUsers = sortData(filteredUsers, userSort)
  const sortedStores = sortData(filteredStores, storeSort)
  const sortedRatings = sortData(ratings, ratingSort)

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">System Administrator</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, Admin</span>
            <Button variant="outline" size="sm" onClick={refreshAllData}>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="stores">Store Management</TabsTrigger>
            <TabsTrigger value="ratings">Rating Management</TabsTrigger>
          </TabsList>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {users.filter((u) => u.status === "active").length} active users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stores.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {stores.filter((s) => s.status === "active").length} active stores
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ratings.length}</div>
                    <p className="text-xs text-muted-foreground">All user reviews</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ratings.length > 0
                        ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
                        : "0.0"}
                    </div>
                    <p className="text-xs text-muted-foreground">Platform average</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">New user "John Doe" registered</span>
                      <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Store "Tech Store" received a 5-star rating</span>
                      <span className="text-xs text-muted-foreground ml-auto">4 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">New store "Food Corner" pending approval</span>
                      <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Button onClick={() => setIsAddUserOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, address, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={userFilters.role}
                  onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="normal_user">Normal User</SelectItem>
                    <SelectItem value="store_owner">Store Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={userFilters.status}
                  onValueChange={(value) => setUserFilters({ ...userFilters, status: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("name", userSort, setUserSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Name</span>
                              <SortIndicator field="name" currentSort={userSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("email", userSort, setUserSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Email</span>
                              <SortIndicator field="email" currentSort={userSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("address", userSort, setUserSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Address</span>
                              <SortIndicator field="address" currentSort={userSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("role", userSort, setUserSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Role</span>
                              <SortIndicator field="role" currentSort={userSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("status", userSort, setUserSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Status</span>
                              <SortIndicator field="status" currentSort={userSort} />
                            </div>
                          </th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedUsers.map((user: User) => (
                          <tr key={user.id} className="border-b">
                            <td className="p-4 font-medium">{user.name}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4 max-w-xs">
                              <div className="truncate" title={user.address}>
                                {user.address}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  user.role === "store_owner"
                                    ? "default"
                                    : user.role === "admin"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {user.role.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={user.status === "active" ? "default" : "destructive"}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewUserDetails(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {user.name}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "stores" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Store Management</h2>
                <Button onClick={() => setIsAddStoreOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stores by name, email, address, owner, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={storeFilters.category}
                  onValueChange={(value) => setStoreFilters({ ...storeFilters, category: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={storeFilters.status}
                  onValueChange={(value) => setStoreFilters({ ...storeFilters, status: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4">Image</th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("name", storeSort, setStoreSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Name</span>
                              <SortIndicator field="name" currentSort={storeSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("email", storeSort, setStoreSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Email</span>
                              <SortIndicator field="email" currentSort={storeSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("address", storeSort, setStoreSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Address</span>
                              <SortIndicator field="address" currentSort={storeSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("rating", storeSort, setStoreSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Rating</span>
                              <SortIndicator field="rating" currentSort={storeSort} />
                            </div>
                          </th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStores.map((store: Store) => (
                          <tr key={store.id} className="border-b">
                            <td className="p-4">
                              <img
                                src={store.image || "/placeholder.svg"}
                                alt={store.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                              />
                            </td>
                            <td className="p-4 font-medium">{store.name}</td>
                            <td className="p-4">{store.email}</td>
                            <td className="p-4 max-w-xs">
                              <div className="truncate" title={store.address}>
                                {store.address}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                {store.rating}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditStore(store)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Store</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {store.name}? This action cannot be undone and
                                        will remove all associated ratings.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteStore(store.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
            {/* Add image upload to Add/Edit Store forms */}
            {/* Add Store Modal: Add image input */}
            <div>
              <Label htmlFor="store-image">Image URL</Label>
              <Input
                id="store-image"
                value={storeForm.image}
                onChange={(e) => setStoreForm({ ...storeForm, image: e.target.value })}
                placeholder="Enter image URL or leave blank for default"
              />
            </div>
            {/* Edit Store Modal: Add image input (repeat for edit form if needed) */}
            <div>
              <Label htmlFor="edit-store-image">Image URL</Label>
              <Input
                id="edit-store-image"
                value={storeForm.image}
                onChange={(e) => setStoreForm({ ...storeForm, image: e.target.value })}
                placeholder="Enter image URL or leave blank for default"
              />
            </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Rating Management</h2>
                <div className="text-sm text-muted-foreground">Total Reviews: {ratings.length}</div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("user", ratingSort, setRatingSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>User</span>
                              <SortIndicator field="user" currentSort={ratingSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("store", ratingSort, setRatingSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Store</span>
                              <SortIndicator field="store" currentSort={ratingSort} />
                            </div>
                          </th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("rating", ratingSort, setRatingSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Rating</span>
                              <SortIndicator field="rating" currentSort={ratingSort} />
                            </div>
                          </th>
                          <th className="text-left p-4">Comment</th>
                          <th
                            className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort("date", ratingSort, setRatingSort)}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Date</span>
                              <SortIndicator field="date" currentSort={ratingSort} />
                            </div>
                          </th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRatings.map((rating: any) => (
                          <tr key={rating.id} className="border-b">
                            <td className="p-4 font-medium">{rating.user}</td>
                            <td className="p-4">{rating.store}</td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="font-medium">{rating.rating}</span>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="truncate" title={rating.comment}>
                                {rating.comment}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{rating.date}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Rating Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="font-medium">User:</Label>
                                        <p>{rating.user}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Store:</Label>
                                        <p>{rating.store}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Rating:</Label>
                                        <div className="flex items-center">
                                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                          <span>{rating.rating}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Comment:</Label>
                                        <p>{rating.comment}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Date:</Label>
                                        <p>{rating.date}</p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Rating</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this rating? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteRating(rating.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Tabs>
      </div>

      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Name:</Label>
                <p className="text-sm">{selectedUser.name}</p>
              </div>
              <div>
                <Label className="font-medium">Email:</Label>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <Label className="font-medium">Address:</Label>
                <p className="text-sm">{selectedUser.address}</p>
              </div>
              <div>
                <Label className="font-medium">Role:</Label>
                <Badge
                  variant={
                    selectedUser.role === "store_owner"
                      ? "default"
                      : selectedUser.role === "admin"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {selectedUser.role.replace("_", " ")}
                </Badge>
              </div>
              {selectedUser.role === "store_owner" && selectedUser.rating && (
                <div>
                  <Label className="font-medium">Store Rating:</Label>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{selectedUser.rating?.toFixed(1)}</span>
                  </div>
                </div>
              )}
              <div>
                <Label className="font-medium">Status:</Label>
                <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                  {selectedUser.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name (20-60 characters)"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              <p className="text-xs text-muted-foreground mt-1">{userForm.name.length}/60 characters</p>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email address"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={userForm.address}
                onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                placeholder="Enter full address (max 400 characters)"
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>}
              <p className="text-xs text-muted-foreground mt-1">{userForm.address.length}/400 characters</p>
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter password (8-16 chars, uppercase + special char)"
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>}
              <p className="text-xs text-muted-foreground mt-1">{userForm.password.length}/16 characters</p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal_user">Normal User</SelectItem>
                  <SelectItem value="store_owner">Store Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={userForm.status} onValueChange={(value) => setUserForm({ ...userForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name (20-60 characters)"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              <p className="text-xs text-muted-foreground mt-1">{userForm.name.length}/60 characters</p>
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email address"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={userForm.address}
                onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                placeholder="Enter full address (max 400 characters)"
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>}
              <p className="text-xs text-muted-foreground mt-1">{userForm.address.length}/400 characters</p>
            </div>
            <div>
              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter new password (8-16 chars, uppercase + special char)"
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>}
              <p className="text-xs text-muted-foreground mt-1">{userForm.password.length}/16 characters</p>
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal_user">Normal User</SelectItem>
                  <SelectItem value="store_owner">Store Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={userForm.status} onValueChange={(value) => setUserForm({ ...userForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Store Modal */}
      <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="store-name">Name *</Label>
              <Input
                id="store-name"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                placeholder="Enter store name (20-60 characters)"
                className={formErrors.storeName ? "border-red-500" : ""}
              />
              {formErrors.storeName && <p className="text-sm text-red-500 mt-1">{formErrors.storeName}</p>}
              <p className="text-xs text-muted-foreground mt-1">{storeForm.name.length}/60 characters</p>
            </div>
            <div>
              <Label htmlFor="store-image">Image URL</Label>
              <Input
                id="store-image"
                value={storeForm.image}
                onChange={(e) => setStoreForm({ ...storeForm, image: e.target.value })}
                placeholder="Enter image URL or leave blank for default"
              />
            </div>
            <div>
              <Label htmlFor="store-description">Description *</Label>
              <Input
                id="store-description"
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                placeholder="Enter store description"
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
            </div>
            <div>
              <Label htmlFor="store-address">Address *</Label>
              <Input
                id="store-address"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                placeholder="Enter store address (max 400 characters)"
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>}
              <p className="text-xs text-muted-foreground mt-1">{storeForm.address.length}/400 characters</p>
            </div>
            <div>
              <Label htmlFor="store-phone">Phone</Label>
              <Input
                id="store-phone"
                type="tel"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                placeholder="Enter store phone number"
              />
            </div>
            <div>
              <Label htmlFor="store-email">Email</Label>
              <Input
                id="store-email"
                type="email"
                value={storeForm.email}
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                placeholder="Enter store email address"
                className={formErrors.storeEmail ? "border-red-500" : ""}
              />
              {formErrors.storeEmail && <p className="text-sm text-red-500 mt-1">{formErrors.storeEmail}</p>}
            </div>
            <div>
              <Label htmlFor="store-category">Category</Label>
              <Select
                value={storeForm.category}
                onValueChange={(value) => setStoreForm({ ...storeForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="store-owner">Owner</Label>
              <Input
                id="store-owner"
                value={storeForm.owner}
                onChange={(e) => setStoreForm({ ...storeForm, owner: e.target.value })}
                placeholder="Enter store owner name"
              />
            </div>
            <div>
              <Label htmlFor="store-status">Status</Label>
              <Select value={storeForm.status} onValueChange={(value) => setStoreForm({ ...storeForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddStoreOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStore}>Add Store</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Store Modal */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-store-name">Name *</Label>
              <Input
                id="edit-store-name"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                placeholder="Enter store name (20-60 characters)"
                className={formErrors.storeName ? "border-red-500" : ""}
              />
              {formErrors.storeName && <p className="text-sm text-red-500 mt-1">{formErrors.storeName}</p>}
              <p className="text-xs text-muted-foreground mt-1">{storeForm.name.length}/60 characters</p>
            </div>
            <div>
              <Label htmlFor="edit-store-image">Image URL</Label>
              <Input
                id="edit-store-image"
                value={storeForm.image}
                onChange={(e) => setStoreForm({ ...storeForm, image: e.target.value })}
                placeholder="Enter image URL or leave blank for default"
              />
            </div>
            <div>
              <Label htmlFor="edit-store-description">Description *</Label>
              <Input
                id="edit-store-description"
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                placeholder="Enter store description"
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
            </div>
            <div>
              <Label htmlFor="edit-store-address">Address *</Label>
              <Input
                id="edit-store-address"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                placeholder="Enter store address (max 400 characters)"
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>}
              <p className="text-xs text-muted-foreground mt-1">{storeForm.address.length}/400 characters</p>
            </div>
            <div>
              <Label htmlFor="edit-store-phone">Phone</Label>
              <Input
                id="edit-store-phone"
                type="tel"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                placeholder="Enter store phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-store-email">Email</Label>
              <Input
                id="edit-store-email"
                type="email"
                value={storeForm.email}
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                placeholder="Enter store email address"
                className={formErrors.storeEmail ? "border-red-500" : ""}
              />
              {formErrors.storeEmail && <p className="text-sm text-red-500 mt-1">{formErrors.storeEmail}</p>}
            </div>
            <div>
              <Label htmlFor="edit-store-category">Category</Label>
              <Select
                value={storeForm.category}
                onValueChange={(value) => setStoreForm({ ...storeForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-store-owner">Owner</Label>
              <Input
                id="edit-store-owner"
                value={storeForm.owner}
                onChange={(e) => setStoreForm({ ...storeForm, owner: e.target.value })}
                placeholder="Enter store owner name"
              />
            </div>
            <div>
              <Label htmlFor="edit-store-status">Status</Label>
              <Select value={storeForm.status} onValueChange={(value) => setStoreForm({ ...storeForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditStoreOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStore}>Update Store</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
