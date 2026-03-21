export default function ContactLoading() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-14">
          <div className="inline-block w-20 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mb-4" />
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-5 w-96 max-w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Developer card skeleton */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse mb-4" />
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
              <div className="space-y-3">
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Form skeleton */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="h-7 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1.5" />
                    <div className="h-11 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  </div>
                  <div>
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1.5" />
                    <div className="h-11 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1.5" />
                  <div className="h-11 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                </div>
                <div>
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1.5" />
                  <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                </div>
                <div className="h-12 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
