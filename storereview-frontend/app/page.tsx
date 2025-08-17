"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, Eye, EyeOff } from "lucide-react"
import { authAPI, storage } from "@/lib/api"

interface LoginRegisterErrors {
  loginEmail?: string
  loginPassword?: string
  general?: string
  name?: string
  email?: string
  address?: string
  password?: string
  confirmPassword?: string
}

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "normal_user",
  })
  const [errors, setErrors] = useState<LoginRegisterErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

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
    if (address.length === 0) return "Address is required"
    return ""
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (password.length > 16) return "Password must not exceed 16 characters"
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must include at least one special character"
    return ""
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: any = {}

    const emailError = validateEmail(loginData.email)
    if (emailError) newErrors.loginEmail = emailError

    if (loginData.password.length === 0) newErrors.loginPassword = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    try {
      const result = await authAPI.login(loginData.email, loginData.password)
      storage.setToken(result.token)
      storage.setUser(result.user)
      localStorage.setItem('userRole', result.user.role)
      localStorage.setItem('userId', result.user.id.toString())
      
      if (result.user.role === "admin") {
        window.location.href = "/accounts/admin"
      } else if (result.user.role === "store_owner") {
        window.location.href = "/accounts/owner"
      } else {
        window.location.href = "/accounts/user"
      }
    } catch (error) {
      setErrors({ general: "Invalid credentials. Please try again." })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: any = {}

    const nameError = validateName(registerData.name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(registerData.email)
    if (emailError) newErrors.email = emailError

    const addressError = validateAddress(registerData.address)
    if (addressError) newErrors.address = addressError

    const passwordError = validatePassword(registerData.password)
    if (passwordError) newErrors.password = passwordError

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    
    try {
      await authAPI.register({
        name: registerData.name,
        email: registerData.email,
        address: registerData.address,
        password: registerData.password,
        role: registerData.role,
      })
      
      alert("Registration successful! Please login.")
      setRegisterData({
        name: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
        role: "normal_user",
      })
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again." })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900 dark:to-red-900 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 animate-in slide-in-from-left duration-1000">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 shadow-2xl transform hover:scale-110 transition-all duration-500 animate-pulse">
              <TrendingUp className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-in slide-in-from-left duration-1000 delay-200">
            StoreReview
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-orange-100 animate-in slide-in-from-left duration-1000 delay-400">
            Smart Reviews • Real Insights • Better Decisions
          </p>
          <div className="space-y-4 text-left animate-in slide-in-from-left duration-1000 delay-600">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <span className="text-lg">Real-time store ratings</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
              <span className="text-lg">Multi-role dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
              <span className="text-lg">Advanced analytics</span>
            </div>
          </div>
        </div>
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-white/10 rounded-full animate-bounce delay-700"></div>
      </div>
      
      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden animate-in slide-in-from-top duration-700">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-full p-4 shadow-lg transform hover:scale-110 transition-all duration-300 animate-in zoom-in duration-500">
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
              StoreReview
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Smart reviews and insights for better decisions
            </p>
          </div>

          {/* Enhanced Card with Animation */}
          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 shadow-2xl border-2 border-orange-200 dark:border-orange-800 animate-in slide-in-from-right duration-700">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-orange-700 dark:text-orange-300">
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-orange-100 to-red-100 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-600 p-1 rounded-lg">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-md transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:shadow-lg data-[state=active]:text-white font-medium hover:bg-orange-50"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="rounded-md transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:shadow-lg data-[state=active]:text-white font-medium hover:bg-red-50"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="animate-in fade-in duration-500">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        className="h-12 px-4 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm sm:text-base hover:border-red-400"
                      />
                      {errors.loginEmail && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.loginEmail}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="h-12 px-4 pr-12 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm sm:text-base hover:border-red-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-700 rounded-md transition-colors duration-200"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      {errors.loginPassword && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.loginPassword}
                        </p>
                      )}
                    </div>
                    {errors.general && (
                      <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-in slide-in-from-left duration-300">
                        {errors.general}
                      </p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base animate-pulse hover:animate-none"
                    >
                      Sign In
                    </Button>
                  </form>

                  <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium">Demo Accounts:</p>
                    <p>• Admin: admin@demo.com</p>
                    <p>• Store Owner: owner@demo.com</p>
                    <p>• User: user@demo.com</p>
                    <p>Password: demo123</p>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="animate-in fade-in duration-500">
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name (20-60 characters)"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        className="h-11 px-4 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm hover:border-red-400"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {registerData.name.length}/60 characters
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Email Address
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        className="h-11 px-4 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm hover:border-red-400"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete address (max 400 characters)"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        required
                        className="min-h-[80px] px-4 py-3 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm resize-none hover:border-red-400"
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.address}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {registerData.address.length}/400 characters
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Account Type
                      </Label>
                      <select
                        title="Role"
                        id="role"
                        className="w-full h-11 px-4 border border-orange-300 bg-white dark:bg-gray-800 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm hover:border-red-400"
                        value={registerData.role}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                      >
                        <option value="normal_user">Normal User</option>
                        <option value="store_owner">Store Owner</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="8-16 chars, 1 uppercase, 1 special char"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                          className="h-11 px-4 pr-12 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm hover:border-red-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-orange-100 dark:hover:bg-orange-700 rounded-md transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {registerData.password.length}/16 characters
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                          className="h-11 px-4 pr-12 rounded-lg border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm hover:border-red-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-orange-100 dark:hover:bg-orange-700 rounded-md transition-colors duration-200"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                    
                    {errors.general && (
                      <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-in slide-in-from-left duration-300">
                        {errors.general}
                      </p>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base animate-pulse hover:animate-none"
                    >
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
