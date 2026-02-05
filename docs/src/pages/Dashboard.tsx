import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  Receipt, 
  Truck,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity
} from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const stats = [
    {
      title: "Total Orders",
      value: "2,543",
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      title: "Revenue",
      value: "$45,231",
      change: "+8%",
      trend: "up", 
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Stock Items",
      value: "1,246",
      change: "-3%",
      trend: "down",
      icon: Package,
      color: "text-warning"
    },
    {
      title: "Pending Deliveries",
      value: "84",
      change: "+2%",
      trend: "up",
      icon: Truck,
      color: "text-destructive"
    }
  ]

  const quickActions = [
    { title: "Create New Order", url: "/orders/new", icon: ShoppingCart, color: "primary" },
    { title: "Add Stock", url: "/stocks?addStock=1", icon: Package, color: "success" },
    { title: "Generate Invoice", url: "/invoices/new", icon: FileText, color: "warning" },
    { title: "Record Payment", url: "/payments/new", icon: CreditCard, color: "destructive" }
  ]

  const recentActivities = [
    { type: "order", message: "New order #ORD-001 created", time: "2 minutes ago", status: "success" },
    { type: "payment", message: "Payment received for Invoice #INV-045", time: "15 minutes ago", status: "success" },
    { type: "stock", message: "Low stock alert: Product XYZ-123", time: "1 hour ago", status: "warning" },
    { type: "delivery", message: "Delivery completed for Order #ORD-098", time: "2 hours ago", status: "success" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manufacturing Sales System Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-success border-success">System Online</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className={`h-3 w-3 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-12"
                asChild
              >
                <Link to={action.url}>
                  <action.icon className="h-4 w-4 mr-3" />
                  {action.title}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system activities and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-success' : 
                      activity.status === 'warning' ? 'bg-warning' : 'bg-destructive'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={activity.status === 'success' ? 'default' : 'destructive'}
                    className={activity.status === 'success' ? 'bg-success' : ''}
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all hover:scale-105 group cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <Package className="h-5 w-5" />
              Stock Management
            </CardTitle>
            <CardDescription>Manage inventory, track stock levels, and handle stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/stocks">Go to Stocks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 group cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              Order Management
            </CardTitle>
            <CardDescription>Create, view, and manage customer orders and sales</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/orders">Go to Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-105 group cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <FileText className="h-5 w-5" />
              Invoice Management
            </CardTitle>
            <CardDescription>Generate, view, and download invoices for completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/invoices">Go to Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard