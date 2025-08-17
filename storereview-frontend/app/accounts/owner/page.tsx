"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Star, Edit, Save, MessageSquare, TrendingUp, Users, LogOut, Calendar, Eye, EyeOff } from "lucide-react"

export default function OwnerDashboard() {
  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState<{ name?: string; location?: string; email?: string }>({})
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({})
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [storeData, setStoreData] = useState({
    name: "Tech Store",
    description: "Latest electronics and gadgets with excellent customer service",
    category: "Electronics",
    location: "Downtown",
    phone: "+1 (555) 123-4567",
    email: "contact@techstore.com",
    hours: "9:00 AM - 8:00 PM",
  })

  // Real data for ratings and stats
  const [ratings, setRatings] = useState([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [totalRatings, setTotalRatings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
      try {
        // Fetch the store(s) owned by this user
        const storeRes = await fetch("http://localhost:3001/api/my-store", {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        })
        if (!storeRes.ok) throw new Error("Failed to fetch store")
        const storeData = await storeRes.json()
        if (!storeData.store || !storeData.store.id) {
          setRatings([])
          setAverageRating(null)
          setTotalRatings(0)
          setLoading(false)
          return
        }
        // Fetch ratings for this store
        const res = await fetch(`http://localhost:3001/api/stores/${storeData.store.id}/ratings`)
        if (res.ok) {
          const data = await res.json()
          setRatings(data || [])
          setTotalRatings(data.length)
          if (data.length > 0) {
            const avg = data.reduce((acc: number, r: any) => acc + r.rating, 0) / data.length
            setAverageRating(Number(avg.toFixed(2)))
          } else {
            setAverageRating(null)
          }
        } else {
          setRatings([])
          setAverageRating(null)
          setTotalRatings(0)
        }
      } catch (err) {
        setRatings([])
        setAverageRating(null)
        setTotalRatings(0)
      }
      setLoading(false)
    }
    fetchRatings()
  }, [])

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

  const validateAddress = (address: string) => {
    if (address.length > 400) return "Address must not exceed 400 characters"
    return ""
  }

  const validatePassword = (password: string) => {
    if (password.length < 8 || password.length > 16) {
      return "Password must be 8-16 characters long"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must include at least one special character"
    }
    return ""
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // Clear any stored authentication data
      localStorage.removeItem("userToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userId")

      // Redirect to login page
      window.location.href = "/"
    }
  }

  const handleSaveStore = () => {
    const newErrors: any = {}

    const nameError = validateName(storeData.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(storeData.email)
    if (emailError) newErrors.email = emailError

    const locationError = validateAddress(storeData.location)
    if (locationError) newErrors.location = locationError

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setFormErrors({})
    setIsEditing(false)
    alert("Store information updated successfully!")
  }

  const handlePasswordUpdate = () => {
    const newErrors: any = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    const passwordError = validatePassword(passwordData.newPassword)
    if (passwordError) {
      newErrors.newPassword = passwordError
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors)
      return
    }

    setPasswordErrors({})
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setShowPasswordUpdate(false)
    alert("Password updated successfully!")
  }

  const handleReplyToRating = (ratingId: number) => {
    // Mock reply functionality
    alert("Reply feature would open here")
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Store Owner Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, Store Owner</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="store-info">Store Information</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRatings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRating !== null ? averageRating : "N/A"}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest ratings and customer interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratings.slice(0, 3).map((rating: any) => (
                    <div key={rating.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rating.user}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex">{renderStars(rating.rating)}</div>
                            <span className="text-sm text-muted-foreground">{rating.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rating.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store-info" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Manage your store details and contact information</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSaveStore : () => setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Store
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input
                      id="store-name"
                      value={storeData.name}
                      onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="20-60 characters"
                    />
                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">{storeData.name.length}/60 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={storeData.category}
                      onChange={(e) => setStoreData({ ...storeData, category: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={storeData.description}
                    onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={storeData.location}
                      onChange={(e) => setStoreData({ ...storeData, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Max 400 characters"
                    />
                    {formErrors.location && <p className="text-sm text-destructive">{formErrors.location}</p>}
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">{storeData.location.length}/400 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={storeData.phone}
                      onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeData.email}
                      onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                    {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">Business Hours</Label>
                    <Input
                      id="hours"
                      value={storeData.hours}
                      onChange={(e) => setStoreData({ ...storeData, hours: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Ratings & Reviews</CardTitle>
                <CardDescription>All ratings and reviews for your store</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="space-y-6">
                    {ratings.length === 0 ? (
                      <div>No ratings yet.</div>
                    ) : (
                      ratings.map((rating: any) => (
                        <div key={rating.id} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium">{rating.user}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex">{renderStars(rating.rating)}</div>
                                <span className="text-sm text-muted-foreground flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {rating.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4">{rating.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Change your account password for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="8-16 characters, uppercase & special character"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{passwordData.newPassword.length}/16 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handlePasswordUpdate} className="flex-1">
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                      setPasswordErrors({})
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
