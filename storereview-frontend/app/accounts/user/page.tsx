interface UserRating {
  id: number;
  store: string;
  rating: number;
  comment: string;
  date: string;
}
"use client"

import { useState, useEffect } from "react"

interface Store {
  id: number;
  name: string;
  description?: string;
  address: string;
  rating?: number;
  reviews?: number;
  category?: string;
  location?: string;
  image?: string;
  userRating?: number | null;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Star, Search, Filter, User, LogOut, MapPin, Clock, Settings, Eye, EyeOff, Edit } from "lucide-react"

export default function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isEditingRating, setIsEditingRating] = useState(false)

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})

  const [stores, setStores] = useState<Store[]>([])

  // Authentication check on page load
  useEffect(() => {
    const token = getToken();
    console.log('Page loaded - Auth check:'); // Debug
    console.log('Token found:', token ? 'YES' : 'NO'); // Debug
    console.log('localStorage keys:', Object.keys(localStorage)); // Debug
    if (!token) {
      console.log('No token found, redirecting to login...'); // Debug
      window.location.href = '/';
      return;
    }
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/stores");
        if (res.ok) {
          const data = await res.json();
          console.log('Stores API response:', data); // Debug log
          // Add sample images if missing
          // Assign images based on store name keywords
          function getImageForStore(name: string) {
            const lower = name.toLowerCase();
            if (lower.includes("grocery")) return "/grocery-store.png";
            if (lower.includes("book")) return "/cozy-bookstore.png";
            if (lower.includes("italian") || lower.includes("restaurant") || lower.includes("food")) return "/cozy-italian-restaurant.png";
            if (lower.includes("electronic")) return "/electronics-store-interior.png";
            if (lower.includes("fashion") || lower.includes("boutique")) return "/fashion-store-boutique.png";
            return "/placeholder-logo.png";
          }
          const storesWithImages = (data.stores || data || []).map((store: Store) => ({
            ...store,
            image: store.image || getImageForStore(store.name || ""),
          }));
          setStores(storesWithImages);
        } else {
          const err = await res.text();
          console.error("Error fetching stores:", err);
        }
      } catch (e) {
        console.error("Fetch stores exception:", e);
      }
    };
    fetchStores();
  }, []);

  const [myRatings, setMyRatings] = useState<UserRating[]>([])

  // Helper to get auth token
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;

  // Fetch user ratings from backend
  const fetchUserRatings = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3001/api/ratings/user", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyRatings(data.ratings || []);
      }
    } catch (err) {
      console.error('Error fetching user ratings:', err);
    }
  };

  useEffect(() => {
    fetchUserRatings();
  }, []);

  const filteredStores = stores.filter(
    (store) =>
      (store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (store.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  const handleRateStore = (store: Store) => {
  setSelectedStore(store)
    if (store.userRating) {
      // Editing existing rating
      setIsEditingRating(true)
      setRating(store.userRating)
      const existingRating = myRatings.find((r) => r.store === store.name)
      setComment(existingRating?.comment || "")
    } else {
      // New rating
      setIsEditingRating(false)
      setRating(0)
      setComment("")
    }
  }

  const submitRating = async () => {
    console.log('submitRating called'); // Debug
    if (rating === 0) {
      alert("Please select a rating")
      return
    }
    if (!selectedStore) return;
    const token = getToken();
    console.log('Token check result:', token ? 'Token found' : 'No token'); // Debug
    console.log('Available localStorage keys:', Object.keys(localStorage)); // Debug
    console.log('userToken value:', localStorage.getItem('userToken')); // Debug
    console.log('token value:', localStorage.getItem('token')); // Debug
    if (!token) {
      alert("You must be logged in to rate stores.");
      return;
    }
    try {
      let res;
      if (isEditingRating) {
        // Find the rating id for this store
        const existing = myRatings.find(r => r.store === selectedStore.name);
        if (existing) {
          res = await fetch(`http://localhost:3001/api/ratings/${existing.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment })
          });
        }
      } else {
        res = await fetch("http://localhost:3001/api/ratings", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ store_id: selectedStore.id, rating, comment })
        });
      }
      if (res && res.ok) {
        alert(`Rating ${isEditingRating ? "updated" : "submitted"} for ${selectedStore.name}!`);
        // Refresh ratings from backend
        await fetchUserRatings();
        // Update userRating for the store in local state
        setStores((prevStores) =>
          prevStores.map((store) =>
            store.id === selectedStore.id ? { ...store, userRating: rating } : store
          )
        );
      } else {
        alert("Failed to submit rating.");
      }
    } catch (err) {
      alert("Error submitting rating.");
      console.error(err);
    }
    setSelectedStore(null)
    setRating(0)
    setComment("")
    setIsEditingRating(false)
  }

  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (password.length < 8 || password.length > 16) {
      errors.push("Password must be 8-16 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }
    return errors
  }

  const handlePasswordUpdate = () => {
    const errors: PasswordErrors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required"
    }

    const newPasswordErrors = validatePassword(passwordData.newPassword)
    if (newPasswordErrors.length > 0) {
      errors.newPassword = newPasswordErrors[0]
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setPasswordErrors(errors)

    if (Object.keys(errors).length === 0) {
      alert("Password updated successfully!")
      setShowPasswordDialog(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordErrors({})
    }
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userId")
      window.location.href = "/"
    }
  }

  const renderStars = (currentRating: number, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < currentRating ? "text-yellow-400 fill-current" : "text-gray-300"
        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Store Browser</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, User</span>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Password</DialogTitle>
                  <DialogDescription>
                    Change your account password. Password must be 8-16 characters with at least one uppercase letter
                    and one special character.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className={passwordErrors.currentPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className={passwordErrors.newPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handlePasswordUpdate} className="flex-1">
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredStores.map((store) => (
            <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img src={store.image || "/placeholder.svg"} alt={store.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <Badge variant="secondary">{store.category}</Badge>
                </div>
                <CardDescription>{store.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{store.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.floor(store.rating ?? 0))}
                      <span className="text-sm font-medium ml-2">{store.rating}</span>
                      <span className="text-sm text-muted-foreground">({store.reviews} reviews)</span>
                    </div>
                  </div>

                  {store.userRating && (
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your Rating:</span>
                        <div className="flex items-center space-x-1">{renderStars(store.userRating)}</div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleRateStore(store)}
                    variant={store.userRating ? "outline" : "default"}
                  >
                    {store.userRating ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Modify Rating
                      </>
                    ) : (
                      "Submit Rating"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Ratings Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Recent Ratings</CardTitle>
            <CardDescription>Your recent store ratings and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myRatings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{rating.store}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rating.comment}</p>
                    <div className="flex items-center mt-2">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-muted-foreground ml-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {rating.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedStore ? (isEditingRating ? `Modify Rating for ${selectedStore.name}` : `Rate ${selectedStore.name}`) : ''}
              </CardTitle>
              <CardDescription>Share your experience with other users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <div className="flex space-x-1">{renderStars(rating, true)}</div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
                <textarea
                  className="w-full p-3 border border-input bg-background rounded-md resize-none"
                  rows={3}
                  placeholder="Share your thoughts about this store..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={submitRating} className="flex-1">
                  {isEditingRating ? "Update Rating" : "Submit Rating"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedStore(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
