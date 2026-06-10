import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  // 1. Calculate Revenue (orders with status that implies payment)
  const paidOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
      },
    },
    select: {
      total: true,
    },
  });
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  // 2. Count Total Orders (excluding PENDING/CANCELLED in store stats for accuracy, or showing all)
  const totalOrdersCount = await prisma.order.count({
    where: {
      status: {
        not: "PENDING",
      },
    },
  });

  // 3. Count Low Stock Products (stock <= 5)
  const lowStockCount = await prisma.product.count({
    where: {
      stock: {
        lte: 5,
      },
    },
  });

  // 4. Count Published Journal Posts
  const journalCount = await prisma.journalPost.count({
    where: {
      published: true,
    },
  });

  // 5. Fetch Recent Orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // 6. Fetch Low Stock Products
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: 5,
      },
    },
    select: {
      id: true,
      name: true,
      stock: true,
      price: true,
    },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-medium sm:text-4xl text-wood-dark">
          Dashboard Overview
        </h1>
        <p className="text-text-secondary text-sm sm:text-base mt-1">
          Real-time summary of your store activity, sales, and operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-wood-dark">{formatPrice(totalRevenue)}</div>
            <p className="text-[10px] text-text-secondary mt-1">From paid & processed orders</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Paid/Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-wood-dark">{totalOrdersCount}</div>
            <p className="text-[10px] text-text-secondary mt-1">Excludes unpaid pending orders</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Low Stock Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-[10px] text-text-secondary mt-1">Products with stock ≤ 5 units</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Journal Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-wood-dark">{journalCount}</div>
            <p className="text-[10px] text-text-secondary mt-1">Published journal posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders Card */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-lg font-medium text-wood-dark">
                Recent Orders
              </CardTitle>
              <Link href="/admin/orders" className="text-xs font-medium text-wood-medium hover:underline">
                View all orders
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6">No orders found yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {order.user.name || order.user.email} &bull; {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        order.status === "PAID" ? "bg-green-100 text-green-800" :
                        order.status === "DELIVERED" ? "bg-blue-100 text-blue-800" :
                        order.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Checklist Card */}
        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-lg font-medium text-wood-dark">
                Stock Warnings
              </CardTitle>
              <Link href="/admin/products" className="text-xs font-medium text-wood-medium hover:underline">
                Manage products
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6">All products are well stocked.</p>
            ) : (
              <div className="divide-y divide-border">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{product.name}</p>
                      <p className="text-xs text-text-secondary">Price: {formatPrice(product.price)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                        product.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
