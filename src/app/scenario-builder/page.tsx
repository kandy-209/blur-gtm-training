'use client';

import { useState, useEffect, useMemo } from 'react';
import { scenarios as defaultScenarios } from '@/data/scenarios';
import { Scenario } from '@/types/roleplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Search, Upload, Download, Copy, Eye, X, CheckCircle2, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import Link from 'next/link';

const STORAGE_KEY = 'scenario_builder_scenarios';

export default function ScenarioBuilderPage() {
  const [localScenarios, setLocalScenarios] = useState<Scenario[]>(defaultScenarios);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [formData, setFormData] = useState<Partial<Scenario>>({
    id: '',
    persona: {
      name: '',
      currentSolution: '',
      primaryGoal: '',
      skepticism: '',
      tone: '',
    },
    objection_category: '',
    objection_statement: '',
    keyPoints: [],
  });

  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Load scenarios from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocalScenarios(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load scenarios from storage:', error);
      // Show user-friendly error but don't crash
      setImportError('Failed to load saved scenarios. Using defaults.');
      setTimeout(() => setImportError(null), 5000);
    }
  }, []);

  // Save scenarios to localStorage whenever they change (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (localScenarios.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localScenarios));
      } catch (error) {
        console.error('Failed to save scenarios to storage:', error);
        // Show user-friendly error
        setImportError('Failed to save scenarios to storage. Your changes may not persist.');
        setTimeout(() => setImportError(null), 5000);
      }
    }
  }, [localScenarios]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.id?.trim()) {
      errors.id = 'Scenario ID is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.id)) {
      errors.id = 'ID must be uppercase letters, numbers, and underscores only';
    } else if (isCreating && localScenarios.some(s => s.id === formData.id)) {
      errors.id = 'Scenario ID already exists';
    }

    if (!formData.persona?.name?.trim()) {
      errors.personaName = 'Persona name is required';
    }

    if (!formData.objection_category) {
      errors.category = 'Objection category is required';
    }

    if (!formData.objection_statement?.trim()) {
      errors.objection = 'Objection statement is required';
    }

    if (!formData.keyPoints || formData.keyPoints.length === 0) {
      errors.keyPoints = 'At least one key point is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaveStatus('saving');

    const scenario: Scenario = {
      id: formData.id!,
      persona: formData.persona as Scenario['persona'],
      objection_category: formData.objection_category || '',
      objection_statement: formData.objection_statement || '',
      keyPoints: formData.keyPoints || [],
    };

    try {
      if (isCreating) {
        setLocalScenarios([...localScenarios, scenario]);
        setIsCreating(false);
      } else if (editingId) {
        setLocalScenarios(localScenarios.map(s => s.id === editingId ? scenario : s));
        setEditingId(null);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);

      // Reset form
      setFormData({
        id: '',
        persona: { name: '', currentSolution: '', primaryGoal: '', skepticism: '', tone: '' },
        objection_category: '',
        objection_statement: '',
        keyPoints: [],
      });
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save scenario:', error);
    }
  };

  const handleEdit = (scenario: Scenario) => {
    setFormData(scenario);
    setEditingId(scenario.id);
    setIsCreating(false);
    setFormErrors({});
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      setLocalScenarios(localScenarios.filter(s => s.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({
          id: '',
          persona: { name: '', currentSolution: '', primaryGoal: '', skepticism: '', tone: '' },
          objection_category: '',
          objection_statement: '',
          keyPoints: [],
        });
      }
    }
  };

  const handleDuplicate = (scenario: Scenario) => {
    const newId = `${scenario.id}_COPY_${Date.now().toString().slice(-6)}`;
    const duplicated: Scenario = {
      ...scenario,
      id: newId,
    };
    setLocalScenarios([...localScenarios, duplicated]);
    handleEdit(duplicated);
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData({
        ...formData,
        keyPoints: [...(formData.keyPoints || []), newKeyPoint.trim()],
      });
      setNewKeyPoint('');
      setFormErrors({ ...formErrors, keyPoints: '' });
    }
  };

  const removeKeyPoint = (index: number) => {
    const updated = formData.keyPoints?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      keyPoints: updated,
    });
    if (updated.length === 0) {
      setFormErrors({ ...formErrors, keyPoints: 'At least one key point is required' });
    }
  };

  const exportScenarios = () => {
    const dataStr = JSON.stringify(localScenarios, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scenarios_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          // Merge with existing, avoiding duplicates
          const existingIds = new Set(localScenarios.map(s => s.id));
          const newScenarios = imported.filter((s: Scenario) => !existingIds.has(s.id));
          if (newScenarios.length > 0) {
            setLocalScenarios([...localScenarios, ...newScenarios]);
            setImportSuccess(`Successfully imported ${newScenarios.length} new scenario(s)`);
            setTimeout(() => setImportSuccess(null), 5000);
          } else {
            setImportError('No new scenarios to import (all already exist)');
            setTimeout(() => setImportError(null), 5000);
          }
        } else {
          setImportError('Invalid file format. Expected an array of scenarios.');
          setTimeout(() => setImportError(null), 5000);
        }
      } catch (error) {
        setImportError('Failed to parse JSON file. Please check the format.');
        console.error('Import error:', error);
        setTimeout(() => setImportError(null), 5000);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file. Please try again.');
      setTimeout(() => setImportError(null), 5000);
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const resetToDefaults = () => {
    if (confirm('Reset to default scenarios? This will replace all current scenarios.')) {
      setLocalScenarios(defaultScenarios);
      setEditingId(null);
      setIsCreating(false);
    }
  };

  const filteredScenarios = useMemo(() => {
    return localScenarios.filter(scenario => {
      const matchesSearch = searchQuery === '' || 
        scenario.persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.objection_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || scenario.objection_category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [localScenarios, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(localScenarios.map(s => s.objection_category));
    return Array.from(cats).sort();
  }, [localScenarios]);

  const previewScenario = filteredScenarios.find(s => s.id === previewId);

  return (
    <ProtectedRoute>
      <ErrorBoundaryWithContext component="ScenarioBuilderPage">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Error/Success Messages */}
          {importError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{importError}</p>
              </div>
              <button
                onClick={() => setImportError(null)}
                className="text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {importSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700 mt-1">{importSuccess}</p>
              </div>
              <button
                onClick={() => setImportSuccess(null)}
                className="text-green-600 hover:text-green-800"
                aria-label="Dismiss success message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Scenario Builder</h1>
            <p className="text-gray-600 mt-2">Create and manage training scenarios for role-play practice</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsCreating(true)} className="bg-gray-900 hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <Button onClick={exportScenarios} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={resetToDefaults} variant="outline" className="text-red-600 hover:text-red-700">
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{localScenarios.length}</div>
              <div className="text-sm text-gray-600">Total Scenarios</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{filteredScenarios.length}</div>
              <div className="text-sm text-gray-600">Showing</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  placeholder="Search scenarios by name, ID, or objection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        {(isCreating || editingId) && (
          <Card className="border-2 border-gray-900">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {isCreating ? 'Create New Scenario' : `Edit Scenario: ${editingId}`}
                  </CardTitle>
                  <CardDescription>Define the persona, objection, and key talking points</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({
                      id: '',
                      persona: { name: '', currentSolution: '', primaryGoal: '', skepticism: '', tone: '' },
                      objection_category: '',
                      objection_statement: '',
                      keyPoints: [],
                    });
                    setFormErrors({});
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Scenario ID */}
              <div>
                <Label htmlFor="scenario-id">
                  Scenario ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scenario-id"
                  value={formData.id}
                  onChange={(e) => {
                    setFormData({ ...formData, id: e.target.value.toUpperCase() });
                    setFormErrors({ ...formErrors, id: '' });
                  }}
                  placeholder="e.g., SKEPTIC_VPE_001"
                  className={formErrors.id ? 'border-red-500' : ''}
                  disabled={!!editingId}
                />
                {formErrors.id && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.id}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Uppercase letters, numbers, and underscores only</p>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="objection-category">
                  Objection Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.objection_category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, objection_category: value });
                    setFormErrors({ ...formErrors, category: '' });
                  }}
                >
                  <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Competitive_Copilot">Competitive (Copilot)</SelectItem>
                    <SelectItem value="Security_Privacy">Security & Privacy</SelectItem>
                    <SelectItem value="Pricing_Value">Pricing & Value</SelectItem>
                    <SelectItem value="Integration_Complexity">Integration Complexity</SelectItem>
                    <SelectItem value="Adoption_Concerns">Adoption Concerns</SelectItem>
                    <SelectItem value="Code_Quality">Code Quality</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* Persona Name */}
              <div>
                <Label htmlFor="persona-name">
                  Persona Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="persona-name"
                  value={formData.persona?.name || ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      persona: { ...formData.persona!, name: e.target.value },
                    });
                    setFormErrors({ ...formErrors, personaName: '' });
                  }}
                  placeholder="e.g., Skeptical VP of Engineering"
                  className={formErrors.personaName ? 'border-red-500' : ''}
                />
                {formErrors.personaName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.personaName}
                  </p>
                )}
              </div>

              {/* Current Solution */}
              <div>
                <Label htmlFor="current-solution">Current Solution</Label>
                <Textarea
                  id="current-solution"
                  value={formData.persona?.currentSolution || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      persona: { ...formData.persona!, currentSolution: e.target.value },
                    })
                  }
                  placeholder="What tools/solutions do they currently use?"
                  rows={3}
                />
              </div>

              {/* Primary Goal */}
              <div>
                <Label htmlFor="primary-goal">Primary Goal</Label>
                <Textarea
                  id="primary-goal"
                  value={formData.persona?.primaryGoal || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      persona: { ...formData.persona!, primaryGoal: e.target.value },
                    })
                  }
                  placeholder="What is their main objective?"
                  rows={3}
                />
              </div>

              {/* Skepticism */}
              <div>
                <Label htmlFor="skepticism">Skepticism & Concerns</Label>
                <Textarea
                  id="skepticism"
                  value={formData.persona?.skepticism || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      persona: { ...formData.persona!, skepticism: e.target.value },
                    })
                  }
                  placeholder="What are their concerns or doubts?"
                  rows={3}
                />
              </div>

              {/* Tone */}
              <div>
                <Label htmlFor="tone">Communication Tone</Label>
                <Textarea
                  id="tone"
                  value={formData.persona?.tone || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      persona: { ...formData.persona!, tone: e.target.value },
                    })
                  }
                  placeholder="How do they communicate? (professional, technical, etc.)"
                  rows={2}
                />
              </div>

              {/* Objection Statement */}
              <div>
                <Label htmlFor="objection-statement">
                  Objection Statement <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="objection-statement"
                  value={formData.objection_statement || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, objection_statement: e.target.value });
                    setFormErrors({ ...formErrors, objection: '' });
                  }}
                  placeholder="The initial objection the prospect will raise"
                  className={`min-h-[120px] ${formErrors.objection ? 'border-red-500' : ''}`}
                />
                {formErrors.objection && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.objection}
                  </p>
                )}
              </div>

              {/* Key Points */}
              <div>
                <Label>
                  Key Points (What the rep should mention) <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyPoint}
                    onChange={(e) => setNewKeyPoint(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyPoint();
                      }
                    }}
                    placeholder="Add a key point and press Enter"
                  />
                  <Button onClick={addKeyPoint} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formErrors.keyPoints && (
                  <p className="text-sm text-red-500 mb-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.keyPoints}
                  </p>
                )}
                <div className="space-y-2 min-h-[60px] border rounded-lg p-3 bg-gray-50">
                  {formData.keyPoints && formData.keyPoints.length > 0 ? (
                    formData.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start justify-between p-2 bg-white rounded border">
                        <span className="flex-1 text-sm">{point}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyPoint(idx)}
                          className="ml-2 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">No key points added yet</p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleSave} 
                  className="bg-gray-900 hover:bg-gray-800"
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>Saving...</>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>Save Scenario</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({
                      id: '',
                      persona: { name: '', currentSolution: '', primaryGoal: '', skepticism: '', tone: '' },
                      objection_category: '',
                      objection_statement: '',
                      keyPoints: [],
                    });
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                {editingId && (
                  <Link href={`/roleplay/${editingId}`} className="ml-auto">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scenarios Grid */}
        {filteredScenarios.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500">No scenarios found. {searchQuery && 'Try adjusting your search.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{scenario.persona.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{scenario.objection_category.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-3">{scenario.objection_statement}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{scenario.keyPoints?.length || 0} key points</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(scenario)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(scenario)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                    <Link href={`/roleplay/${scenario.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(scenario.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}

