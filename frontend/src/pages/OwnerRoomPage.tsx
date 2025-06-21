import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sofa, 
  Monitor, 
  Lightbulb, 
  Frame, 
  Package, 
  Sparkles,
  ShoppingCart,
  RotateCcw,
  Save,
  Download,
  Upload,
  Settings,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Room themes and customization options
const ROOM_THEMES = [
  {
    id: 'beach',
    name: 'Tropical Beach',
    description: 'Bright and airy with ocean-inspired colors',
    colors: { primary: '#4FC3F7', secondary: '#FFD54F', accent: '#81C784' },
    unlocked: true,
    cost: 0
  },
  {
    id: 'sunset',
    name: 'Sunset Paradise',
    description: 'Warm sunset tones with romantic lighting',
    colors: { primary: '#FF8A65', secondary: '#FFCC02', accent: '#FF7043' },
    unlocked: true,
    cost: 0
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Cool blue tones with aquatic elements',
    colors: { primary: '#1976D2', secondary: '#0288D1', accent: '#03DAC6' },
    unlocked: false,
    cost: 5000
  },
  {
    id: 'luxury',
    name: 'Luxury Suite',
    description: 'Elegant and sophisticated with premium materials',
    colors: { primary: '#6A1B9A', secondary: '#FF6F00', accent: '#C0CA33' },
    unlocked: false,
    cost: 10000
  },
  {
    id: 'gaming',
    name: 'Gaming Den',
    description: 'High-tech gaming setup with RGB lighting',
    colors: { primary: '#E91E63', secondary: '#00E676', accent: '#FF3D00' },
    unlocked: false,
    cost: 7500
  }
];

const FURNITURE_CATEGORIES = {
  seating: {
    name: 'Seating',
    icon: <Sofa className="w-5 h-5" />,
    items: [
      { id: 'chair_basic', name: 'Basic Chair', cost: 500, unlocked: true },
      { id: 'sofa_comfort', name: 'Comfort Sofa', cost: 1200, unlocked: true },
      { id: 'chair_gaming', name: 'Gaming Chair', cost: 2000, unlocked: false },
      { id: 'sofa_luxury', name: 'Luxury Sofa', cost: 3500, unlocked: false }
    ]
  },
  electronics: {
    name: 'Electronics',
    icon: <Monitor className="w-5 h-5" />,
    items: [
      { id: 'tv_basic', name: 'Basic TV', cost: 800, unlocked: true },
      { id: 'pc_setup', name: 'PC Setup', cost: 2500, unlocked: true },
      { id: 'gaming_console', name: 'Gaming Console', cost: 1800, unlocked: false },
      { id: 'home_theater', name: 'Home Theater', cost: 5000, unlocked: false }
    ]
  },
  lighting: {
    name: 'Lighting',
    icon: <Lightbulb className="w-5 h-5" />,
    items: [
      { id: 'lamp_desk', name: 'Desk Lamp', cost: 300, unlocked: true },
      { id: 'lamp_floor', name: 'Floor Lamp', cost: 600, unlocked: true },
      { id: 'led_strip', name: 'LED Strip', cost: 900, unlocked: false },
      { id: 'chandelier', name: 'Chandelier', cost: 2500, unlocked: false }
    ]
  },
  decoration: {
    name: 'Decoration',
    icon: <Frame className="w-5 h-5" />,
    items: [
      { id: 'poster_doax', name: 'DOAXVV Poster', cost: 200, unlocked: true },
      { id: 'plant_small', name: 'Small Plant', cost: 400, unlocked: true },
      { id: 'figurine_kasumi', name: 'Kasumi Figurine', cost: 800, unlocked: false },
      { id: 'painting_beach', name: 'Beach Painting', cost: 1500, unlocked: false }
    ]
  }
};

const ROOM_LAYOUTS = [
  { id: 'cozy', name: 'Cozy Corner', description: 'Intimate and comfortable' },
  { id: 'minimal', name: 'Minimalist', description: 'Clean and simple' },
  { id: 'gamer', name: 'Gaming Setup', description: 'Optimized for gaming' },
  { id: 'social', name: 'Social Hub', description: 'Perfect for gatherings' }
];

export default function OwnerRoomPage() {
  const [selectedTheme, setSelectedTheme] = useState('beach');
  const [selectedLayout, setSelectedLayout] = useState('cozy');
  const [placedFurniture, setPlacedFurniture] = useState([
    { id: 'chair_basic', position: { x: 30, y: 40 } },
    { id: 'tv_basic', position: { x: 60, y: 20 } }
  ]);
  const [roomSettings, setRoomSettings] = useState({
    lighting: [75],
    ambiance: [60],
    privacy: [100]
  });
  const [vStones, setVStones] = useState(15000);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'

  const currentTheme = ROOM_THEMES.find(theme => theme.id === selectedTheme);

  const handleFurniturePlace = (furnitureId: string) => {
    // Add furniture to random position for demo
    const newPosition = {
      x: Math.random() * 70 + 10,
      y: Math.random() * 60 + 20
    };
    setPlacedFurniture(prev => [...prev, { id: furnitureId, position: newPosition }]);
  };

  const handleThemePurchase = (themeId: string, cost: number) => {
    if (vStones >= cost) {
      setVStones(prev => prev - cost);
      // In real implementation, would unlock the theme
      alert(`Purchased theme for ${cost} V-Stones!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-pink via-accent-cyan to-accent-purple bg-clip-text text-transparent">
            Owner's Room
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize your personal space with furniture and decorations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-accent-gold text-black px-4 py-2">
            <Package className="w-4 h-4 mr-2" />
            {vStones.toLocaleString()} V-Stones
          </Badge>
          <Button 
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {viewMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Room Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-purple" />
                  Room Preview
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/20"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme?.colors.primary}20, ${currentTheme?.colors.secondary}20)`
                }}
              >
                {/* Room Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-muted/40" />
                
                {/* Furniture Items */}
                {placedFurniture.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute w-12 h-12 bg-accent-cyan/30 border border-accent-cyan rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent-cyan/50 transition-colors"
                    style={{
                      left: `${item.position.x}%`,
                      top: `${item.position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={item.id}
                  >
                    {item.id.includes('chair') || item.id.includes('sofa') ? '🪑' :
                     item.id.includes('tv') || item.id.includes('pc') ? '📺' :
                     item.id.includes('lamp') ? '💡' : '🖼️'}
                  </motion.div>
                ))}
                
                {/* Room Info Overlay */}
                <div className="absolute top-4 left-4 bg-background/90 rounded-lg p-3 space-y-1">
                  <div className="text-sm font-medium">{currentTheme?.name}</div>
                  <div className="text-xs text-muted-foreground">{placedFurniture.length} items placed</div>
                </div>

                {/* Ambient Effects */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 70% 30%, ${currentTheme?.colors.accent}15, transparent 50%)`,
                    opacity: roomSettings.lighting[0] / 100
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Room Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent-pink" />
                Room Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lighting</Label>
                <Slider
                  value={roomSettings.lighting}
                  onValueChange={(value) => setRoomSettings(prev => ({ ...prev, lighting: value }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">{roomSettings.lighting[0]}%</div>
              </div>
              
              <div className="space-y-2">
                <Label>Ambiance</Label>
                <Slider
                  value={roomSettings.ambiance}
                  onValueChange={(value) => setRoomSettings(prev => ({ ...prev, ambiance: value }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">{roomSettings.ambiance[0]}%</div>
              </div>

              <div className="space-y-2">
                <Label>Privacy Level</Label>
                <Slider
                  value={roomSettings.privacy}
                  onValueChange={(value) => setRoomSettings(prev => ({ ...prev, privacy: value }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">{roomSettings.privacy[0]}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button size="sm" variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Store
              </Button>
              <Button size="sm" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Effects
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customization Tabs */}
      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="furniture">Furniture</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ROOM_THEMES.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTheme === theme.id ? 'ring-2 ring-accent-cyan' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                      {theme.unlocked ? (
                        <Badge className="bg-accent-green text-white">Owned</Badge>
                      ) : (
                        <Badge variant="outline">{theme.cost} V-Stones</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                    
                    {/* Color Preview */}
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>

                    <div className="flex gap-2">
                      {theme.unlocked ? (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedTheme(theme.id)}
                            variant={selectedTheme === theme.id ? 'default' : 'outline'}
                          >
                            {selectedTheme === theme.id ? 'Active' : 'Apply'}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-accent-gold text-black"
                          onClick={() => handleThemePurchase(theme.id, theme.cost)}
                          disabled={vStones < theme.cost}
                        >
                          Purchase
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Furniture Tab */}
        <TabsContent value="furniture" className="space-y-6">
          {Object.entries(FURNITURE_CATEGORIES).map(([categoryKey, category]) => (
            <Card key={categoryKey}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-2">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{item.cost} V-Stones</Badge>
                        {item.unlocked ? (
                          <Button 
                            size="sm"
                            onClick={() => handleFurniturePlace(item.id)}
                          >
                            Place
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={vStones < item.cost}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Layouts Tab */}
        <TabsContent value="layouts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {ROOM_LAYOUTS.map((layout) => (
              <Card key={layout.id} className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{layout.name}</h3>
                    <Button 
                      size="sm"
                      onClick={() => setSelectedLayout(layout.id)}
                      variant={selectedLayout === layout.id ? 'default' : 'outline'}
                    >
                      {selectedLayout === layout.id ? 'Active' : 'Apply'}
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{layout.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Furniture Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Special Collections</h3>
                <p className="text-muted-foreground mb-4">
                  Unlock themed furniture sets and exclusive decorations through special events.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 