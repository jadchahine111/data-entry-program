import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type Field, type Template } from './TemplateCard';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check, AlertCircle, Grip } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const fieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
];

interface TemplateFormProps {
  initialData?: Template;
  onSubmit: (data: Template) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [fields, setFields] = useState<Field[]>(
    initialData?.fields || []
  );
  
  const [currentField, setCurrentField] = useState<Field>({
    id: uuidv4(),
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  
  const [currentOption, setCurrentOption] = useState('');
  const isEditMode = !!initialData;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = () => {
    if (!currentField.name) {
      toast.error("Field name is required");
      return;
    }
    
    if (currentField.type === 'select' && (!currentField.options || currentField.options.length === 0)) {
      toast.error("Select fields require at least one option");
      return;
    }
    
    setFields([...fields, { ...currentField, id: uuidv4() }]);
    setCurrentField({
      id: uuidv4(),
      name: '',
      type: 'text',
      required: false,
      options: [],
    });
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const addOption = () => {
    if (!currentOption) return;
    
    setCurrentField({
      ...currentField,
      options: [...(currentField.options || []), currentOption],
    });
    
    setCurrentOption('');
  };

  const removeOption = (option: string) => {
    setCurrentField({
      ...currentField,
      options: currentField.options?.filter((o) => o !== option),
    });
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (fields.length === 0) {
      toast.error("At least one field is required");
      return;
    }
    
    const templateData: Template = {
      id: initialData?.id || uuidv4(),
      name: values.name,
      description: values.description,
      fields,
      recordCount: initialData?.recordCount || 0,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    
    onSubmit(templateData);
  };

  const SortableField = ({ field }: { field: Field }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="flex items-center justify-between p-3 mb-2 bg-white rounded-md border"
      >
        <div className="flex items-center gap-3">
          <div className="cursor-grab touch-none" {...attributes} {...listeners}>
            <Grip className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div>
            <div className="font-medium text-sm">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4">
                {field.type}
              </Badge>
              
              {field.options && field.options.length > 0 && (
                <span className="text-[10px]">
                  {field.options.length} options
                </span>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          type="button" 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => removeField(field.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-glass animate-fade-in">
      <CardHeader className="bg-hospital-50 border-b">
        <CardTitle className="text-xl font-medium text-hospital-800">
          {isEditMode ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter template name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of this template"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Form Fields</h3>
                {fields.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                  </div>
                )}
              </div>
              
              {fields.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map(field => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-6">
                      {fields.map((field) => (
                        <SortableField key={field.id} field={field} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md bg-muted/30">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No fields added yet</p>
                  <p className="text-sm text-muted-foreground">Add fields using the form below</p>
                </div>
              )}
              
              <div className="bg-secondary/50 rounded-md p-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4" />
                  Add New Field
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <FormLabel className="text-sm">Field Name</FormLabel>
                    <Input
                      placeholder="Enter field name"
                      value={currentField.name}
                      onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel className="text-sm">Field Type</FormLabel>
                    <Select
                      value={currentField.type}
                      onValueChange={(value) => {
                        setCurrentField({ 
                          ...currentField, 
                          type: value as Field['type'],
                          options: value === 'select' ? [] : undefined
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Switch
                    checked={currentField.required}
                    onCheckedChange={(checked) => 
                      setCurrentField({ ...currentField, required: checked })
                    }
                    id="required-field"
                  />
                  <FormLabel htmlFor="required-field" className="text-sm cursor-pointer">
                    Required Field
                  </FormLabel>
                </div>
                
                {currentField.type === 'select' && (
                  <div className="mb-4 border rounded-md p-3 bg-white">
                    <FormLabel className="text-sm">Options</FormLabel>
                    
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add option"
                        value={currentOption}
                        onChange={(e) => setCurrentOption(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={addOption}
                        className="bg-hospital-600 hover:bg-hospital-700"
                        disabled={!currentOption}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {currentField.options && currentField.options.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentField.options.map((option) => (
                          <Badge 
                            key={option} 
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {option}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                              onClick={() => removeOption(option)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">No options added</p>
                    )}
                  </div>
                )}
                
                <Button 
                  type="button" 
                  onClick={addField} 
                  className="w-full bg-hospital-600 hover:bg-hospital-700"
                  disabled={!currentField.name}
                >
                  Add Field
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="justify-between border-t pt-4 pb-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gap-1 bg-hospital-600 hover:bg-hospital-700"
              disabled={fields.length === 0}
            >
              <Check className="h-4 w-4" />
              {isEditMode ? 'Update Template' : 'Save Template'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TemplateForm;
