interface LoginRegisterErrors {
  loginEmail?: string;
  loginPassword?: string;
  general?: string;
  name?: string;
  email?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Store, Eye, EyeOff } from "lucide-react"
import { authAPI, storage } from "@/lib/api"

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    address: "", // Added missing address field
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
      
      // Store authentication data
      console.log('Login successful, storing token...'); // Debug
      console.log('Token received:', result.token.substring(0, 20) + '...'); // Debug
      storage.setToken(result.token)
      storage.setUser(result.user)
      
      // Store additional data for compatibility
      localStorage.setItem('userRole', result.user.role)
      localStorage.setItem('userId', result.user.id.toString())
      
      // Verify storage worked
      console.log('Token stored as userToken:', localStorage.getItem('userToken') ? 'SUCCESS' : 'FAILED'); // Debug
      console.log('Token stored as token:', localStorage.getItem('token') ? 'SUCCESS' : 'FAILED'); // Debug
      console.log('All localStorage keys:', Object.keys(localStorage)); // Debug
      
      // Redirect based on role
      if (result.user.role === "admin") {
        window.location.href = "/admin/dashboard"
      } else if (result.user.role === "store_owner") {
        window.location.href = "/owner/dashboard"
      } else {
        window.location.href = "/user/dashboard"
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
      // Reset form
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Animated Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 shadow-lg transform hover:scale-110 transition-all duration-300 animate-in zoom-in duration-500">
              <Store className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Store Rating System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
            Discover, rate, and manage stores with ease
          </p>
        </div>

        {/* Enhanced Card with Animation */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0 animate-in slide-in-from-bottom duration-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <TabsTrigger 
                  value="login" 
                  className="rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-medium"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-in fade-in duration-500">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="h-12 px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                    />
                    {errors.loginEmail && (
                      <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                        {errors.loginEmail}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="h-12 px-4 pr-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
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
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base"
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
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name (20-60 characters)"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                      className="h-11 px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
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
                    <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="h-11 px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address (max 400 characters)"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      required
                      className="min-h-[80px] px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm resize-none"
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
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Type
                    </Label>
                    <select
                      title="Role"
                      id="role"
                      className="w-full h-11 px-4 border border-gray-300 bg-white dark:bg-gray-800 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                      value={registerData.role}
                      onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    >
                      <option value="normal_user">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="h-11 px-4 pr-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
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
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="h-11 px-4 pr-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
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
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base"
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
  )
}
