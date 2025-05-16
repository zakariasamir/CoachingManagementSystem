import type { NextPage } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { Loader2 } from "lucide-react";

const Home: NextPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const router = useRouter();

  useEffect(() => {

    if (!isAuthLoading || !isOrgLoading) {
      if (user && selectedOrganization) {
        router.push(`/${selectedOrganization.role}/dashboard`);
      } else if (user && !selectedOrganization) {
        router.push("/select-organization");
      } else if (!user && !isAuthLoading) {
        router.push("/auth/login");
      }
    }
  }, [user, selectedOrganization, router, isAuthLoading, isOrgLoading]);

  if (isOrgLoading || isAuthLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading organization data...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <section className="container mx-auto px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-100/20 dark:from-primary/5 dark:to-purple-900/10 rounded-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 relative"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome to{" "}
            <span className="text-primary">Coaching Management System</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Streamline your coaching sessions, track progress, and achieve
            success with our comprehensive management platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Link href="/auth/login">Learn More</Link>
            </Button>
          </div>
        </motion.div>
      </section>
      <section className="bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/10 hover:border-primary/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary dark:text-primary/90">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 bg-gradient-to-r from-primary/10 to-purple-500/10 p-12 rounded-3xl"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Ready to Transform Your Coaching Practice?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our platform today and experience the difference of organized,
            efficient coaching management.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <Link href="/auth/login">Start Now</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "Session Management",
    description:
      "Easily schedule, track, and manage all your coaching sessions in one place.",
    icon: (
      <svg
        className="w-6 h-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Goal Tracking",
    description:
      "Set, monitor, and achieve goals with our comprehensive tracking system.",
    icon: (
      <svg
        className="w-6 h-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Progress Reports",
    description:
      "Generate detailed reports to visualize and analyze coaching progress.",
    icon: (
      <svg
        className="w-6 h-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default Home;
