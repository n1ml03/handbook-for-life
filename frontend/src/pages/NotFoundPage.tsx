import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/services/utils';

export default function NotFoundPage() {
  const floatingIcons = [
    { icon: Star, delay: 0, x: 50, y: 30 },
    { icon: Star, delay: 0.5, x: -30, y: 60 },
    { icon: Star, delay: 1, x: 70, y: -20 },
    { icon: Star, delay: 1.5, x: -60, y: -40 },
  ];

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/20 via-accent-cyan/20 to-accent-purple/20" />
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              x: [0, item.x, 0],
              y: [0, item.y, 0]
            }}
            transition={{
              duration: 3,
              delay: item.delay,
              repeat: Infinity,
              repeatDelay: 2
            }}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`
            }}
          >
            <item.icon className="w-8 h-8 text-accent-pink" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-8 max-w-2xl mx-auto px-4"
      >
        {/* 404 Number with gradient */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="relative"
        >
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-accent-pink via-accent-purple to-accent-cyan bg-clip-text text-transparent leading-none">
            404
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
          >
            <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-accent-gold" />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            The page you're looking for seems to have gone on vacation. 
            Don't worry, even our best guides sometimes get lost!
          </p>
        </motion.div>

        {/* Interactive Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="doax-card bg-background/50 backdrop-blur-sm p-8 space-y-6"
        >
          <div className="flex items-center justify-center space-x-2 text-accent-cyan">
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">What you can do:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/home">
                <Button 
                  className={cn(
                    "w-full h-auto p-6 bg-gradient-to-r from-accent-pink to-accent-purple",
                    "hover:from-accent-pink/80 hover:to-accent-purple/80",
                    "text-white font-semibold shadow-lg hover:shadow-xl",
                    "transition-all duration-300"
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Home className="w-6 h-6" />
                    <span>Go to Home</span>
                  </div>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className={cn(
                  "w-full h-auto p-6 border-accent-cyan text-accent-cyan",
                  "hover:bg-accent-cyan/10 hover:border-accent-cyan/80",
                  "font-semibold transition-all duration-300"
                )}
              >
                <div className="flex flex-col items-center space-y-2">
                  <ArrowLeft className="w-6 h-6" />
                  <span>Go Back</span>
                </div>
              </Button>
            </motion.div>
          </div>

          {/* Popular Links */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Popular sections:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'Girls', path: '/girls' },
                { label: 'Swimsuits', path: '/swimsuit' },
                { label: 'Memories', path: '/memories' },
                { label: 'Shop', path: '/shop' }
              ].map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Link 
                    to={link.path}
                    className={cn(
                      "inline-flex items-center px-4 py-2 rounded-full",
                      "bg-accent-ocean/10 text-accent-ocean",
                      "hover:bg-accent-ocean/20 hover:scale-105",
                      "transition-all duration-200 text-sm font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 