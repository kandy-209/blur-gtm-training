'use client';

import { useState } from 'react';
import { scenarios } from '@/data/scenarios';
import { Scenario } from '@/types/roleplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function ScenarioBuilderPage() {
  const [localScenarios, setLocalScenarios] = useState<Scenario[]>(scenarios);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleSave = () => {
    if (!formData.id || !formData.persona?.name) {
      alert('Please fill in all required fields');
      return;
    }

    const scenario: Scenario = {
      id: formData.id,
      persona: formData.persona as Scenario['persona'],
      objection_category: formData.objection_category || '',
      objection_statement: formData.objection_statement || '',
      keyPoints: formData.keyPoints || [],
    };

    if (isCreating) {
      setLocalScenarios([...localScenarios, scenario]);
      setIsCreating(false);
    } else if (editingId) {
      setLocalScenarios(localScenarios.map(s => s.id === editingId ? scenario : s));
      setEditingId(null);
    }

    // Reset form
    setFormData({
      id: '',
      persona: { name: '', currentSolution: '', primaryGoal: '', skepticism: '', tone: '' },
      objection_category: '',
      objection_statement: '',
      keyPoints: [],
    });
  };

  const handleEdit = (scenario: Scenario) => {
    setFormData(scenario);
    setEditingId(scenario.id);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      setLocalScenarios(localScenarios.filter(s => s.id !== id));
    }
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData({
        ...formData,
        keyPoints: [...(formData.keyPoints || []), newKeyPoint.trim()],
      });
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setFormData({
      ...formData,
      keyPoints: formData.keyPoints?.filter((_, i) => i !== index) || [],
    });
  };

  const exportScenarios = () => {
    const dataStr = JSON.stringify(localScenarios, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scenarios.json';
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scenario Builder</h1>
        <div className="space-x-2">
          <Button onClick={() => setIsCreating(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
          <Button onClick={exportScenarios} variant="outline">
            Export JSON
          </Button>
        </div>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Scenario' : 'Edit Scenario'}</CardTitle>
            <CardDescription>Define the persona, objection, and key talking points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scenario-id">Scenario ID</Label>
                <Input
                  id="scenario-id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g., SKEPTIC_VPE_001"
                />
              </div>
              <div>
                <Label htmlFor="objection-category">Objection Category</Label>
                <Select
                  value={formData.objection_category}
                  onValueChange={(value) => setFormData({ ...formData, objection_category: value })}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div>
              <Label htmlFor="persona-name">Persona Name</Label>
              <Input
                id="persona-name"
                value={formData.persona?.name || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    persona: { ...formData.persona!, name: e.target.value },
                  })
                }
                placeholder="e.g., Skeptical VP of Engineering"
              />
            </div>

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
              />
            </div>

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
              />
            </div>

            <div>
              <Label htmlFor="skepticism">Skepticism</Label>
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
              />
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
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
              />
            </div>

            <div>
              <Label htmlFor="objection-statement">Objection Statement</Label>
              <Textarea
                id="objection-statement"
                value={formData.objection_statement}
                onChange={(e) =>
                  setFormData({ ...formData, objection_statement: e.target.value })
                }
                placeholder="The initial objection the prospect will raise"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Key Points (What the rep should mention)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
                  placeholder="Add a key point"
                />
                <Button onClick={addKeyPoint} type="button">Add</Button>
              </div>
              <div className="space-y-2">
                {formData.keyPoints?.map((point, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span>{point}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyPoint(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Scenario</Button>
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
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localScenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <CardTitle className="text-lg">{scenario.persona.name}</CardTitle>
              <CardDescription>{scenario.objection_category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm line-clamp-3">{scenario.objection_statement}</p>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(scenario)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(scenario.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

