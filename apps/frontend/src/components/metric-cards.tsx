import { FileText, AlertTriangle, CheckCircle, Clock, BarChart3, TrendingUp, TrendingDown } from "lucide-react"

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900/20 hover:shadow-xl transition-all group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
            <h3 className="text-3xl font-bold mt-1 text-foreground">124</h3>
            <div className="flex items-center mt-1 text-xs text-green-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-teal-100 dark:bg-teal-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
            style={{ width: "75%" }}
          ></div>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-red-100 dark:border-red-900/20 hover:shadow-xl transition-all group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Flagged Documents</p>
            <h3 className="text-3xl font-bold mt-1 text-foreground">32</h3>
            <div className="flex items-center mt-1 text-xs text-red-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-500 p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-red-100 dark:bg-red-900/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full" style={{ width: "25%" }}></div>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-green-100 dark:border-green-900/20 hover:shadow-xl transition-all group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Similarity</p>
            <h3 className="text-3xl font-bold mt-1 text-foreground">18.4%</h3>
            <div className="flex items-center mt-1 text-xs text-green-600 font-medium">
              <TrendingDown className="h-3 w-3 mr-1" />
              <span>-2.3% from last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-green-100 dark:bg-green-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            style={{ width: "18.4%" }}
          ></div>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900/20 hover:shadow-xl transition-all group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
            <h3 className="text-xl font-bold mt-1 text-foreground truncate max-w-[180px]">Research Paper.pdf</h3>
            <div className="flex items-center mt-1 text-xs text-muted-foreground font-medium">
              <Clock className="h-3 w-3 mr-1" />
              <span>Scanned 2 hours ago</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-blue-100 dark:bg-blue-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            style={{ width: "100%" }}
          ></div>
        </div>
      </div>
    </div>
  )
}