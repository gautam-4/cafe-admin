'use client';

import { useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronRight,
  Package,
  Leaf,
  Search,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function MenuTab() {
  const {
    menuData,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem
  } = useMenu();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('view'); // 'view', 'add-category', 'add-item', 'edit-item', 'edit-category'
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState('');

  // Form states
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', order: 0 });
  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    description: '',
    isVeg: true,
    customizable: false,
    options: []
  });

  const showSuccessMessage = (message) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const resetForms = () => {
    setCategoryForm({ id: '', name: '', order: 0 });
    setItemForm({
      name: '',
      price: '',
      description: '',
      isVeg: true,
      customizable: false,
      options: []
    });
    setMode('view');
  };

  const handleAddCategory = async () => {
    if (!categoryForm.id || !categoryForm.name) {
      alert('Please fill in both Category ID and Name');
      return;
    }

    await addCategory(categoryForm.id, {
      name: categoryForm.name,
      order: categoryForm.order || Object.keys(menuData || {}).length
    });

    showSuccessMessage(`Category "${categoryForm.name}" added successfully!`);
    setSelectedCategory(categoryForm.id);
    resetForms();
  };

  const handleUpdateCategory = async () => {
    if (!categoryForm.name) {
      alert('Category name cannot be empty');
      return;
    }

    await updateCategory(selectedCategory, {
      name: categoryForm.name,
      order: categoryForm.order
    });

    showSuccessMessage('Category updated successfully!');
    resetForms();
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (confirm(`Are you sure you want to delete "${categoryName}" and all its items?`)) {
      await deleteCategory(categoryId);
      showSuccessMessage(`Category "${categoryName}" deleted`);
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
    }
  };

  const handleAddItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      alert('Please fill in item name and price');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: itemForm.name,
      price: Number(itemForm.price),
      description: itemForm.description || '',
      isVeg: itemForm.isVeg,
      customizable: itemForm.customizable,
    };

    // Only add options if customizable is true
    if (itemForm.customizable && itemForm.options.length > 0) {
      newItem.options = normalizeOptions(itemForm.options);
    }


    await addItem(selectedCategory, newItem);
    showSuccessMessage(`"${itemForm.name}" added successfully!`);
    resetForms();
  };

  const handleUpdateItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      alert('Please fill in item name and price');
      return;
    }

    const updates = {
      name: itemForm.name,
      price: Number(itemForm.price),
      description: itemForm.description || '',
      isVeg: itemForm.isVeg,
      customizable: itemForm.customizable,
    };

    // Only include options if customizable
    if (itemForm.customizable && itemForm.options.length > 0) {
      updates.options = itemForm.options;
    } else if (!itemForm.customizable) {
      // Remove options if not customizable
      updates.options = [];
    }

    await updateItem(selectedCategory, selectedItem, updates);
    showSuccessMessage(`"${itemForm.name}" updated successfully!`);
    resetForms();
    setSelectedItem(null);
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (confirm(`Delete "${itemName}"?`)) {
      await deleteItem(selectedCategory, itemId);
      showSuccessMessage(`"${itemName}" deleted`);
    }
  };

  const startEditCategory = (categoryId, category) => {
    setCategoryForm({
      id: categoryId,
      name: category.name,
      order: category.order
    });
    setMode('edit-category');
  };

  const normalizeOptions = (options) =>
    options.map(opt => ({
      id: opt.id,
      label: opt.label,
      price: Number(opt.price) // force number
    }));


  const startEditItem = (item) => {
    setSelectedItem(item.id);
    setItemForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      isVeg: item.isVeg,
      customizable: item.customizable || false,
      options: item.options || []
    });
    setMode('edit-item');
  };

  const addOption = () => {
    const optionId = `option_${Date.now()}`;
    const newOption = {
      id: optionId,
      label: '',
      price: ''
    };
    setItemForm({
      ...itemForm,
      options: [...itemForm.options, newOption]
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...itemForm.options];
    newOptions[index][field] = value;
    setItemForm({ ...itemForm, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = itemForm.options.filter((_, i) => i !== index);
    setItemForm({ ...itemForm, options: newOptions });
  };

  const getCurrentCategory = () => {
    if (!selectedCategory || !menuData) return null;
    return menuData[selectedCategory];
  };

  const getFilteredItems = () => {
    const category = getCurrentCategory();
    if (!category || !category.items) return [];

    if (!searchTerm) return category.items;

    return category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-12 h-12 animate-pulse text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error Loading Menu</p>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 pb-20">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <Check className="w-5 h-5" />
          {showSuccess}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h2>
        <p className="text-gray-600">
          {Object.keys(menuData || {}).length} categories •
          {Object.values(menuData || {}).reduce((sum, cat) => sum + (cat.items?.length || 0), 0)} items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
              <h3 className="font-semibold text-lg">Categories</h3>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  resetForms();
                  setMode('add-category');
                }}
                className="w-full mb-2 py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add New Category
              </button>

              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {Object.entries(menuData || {}).map(([categoryId, category]) => (
                  <div
                    key={categoryId}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all text-black ${selectedCategory === categoryId
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'hover:bg-gray-50'
                      }`}
                    onClick={() => {
                      setSelectedCategory(categoryId);
                      setSearchTerm('');
                      resetForms();
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === categoryId ? 'rotate-90' : ''}`} />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.items?.length || 0} items</p>
                      </div>
                    </div>

                    {selectedCategory === categoryId && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditCategory(categoryId, category);
                          }}
                          className="p-1.5 hover:bg-orange-200 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(categoryId, category.name);
                          }}
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Add/Edit Category Form */}
          {(mode === 'add-category' || mode === 'edit-category') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  {mode === 'add-category' ? 'Add New Category' : 'Edit Category'}
                </h3>
                <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {mode === 'add-category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={categoryForm.id}
                      onChange={(e) => setCategoryForm({
                        ...categoryForm,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      })}
                      placeholder="e.g., drinks, main-courses"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use lowercase letters and hyphens only</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Drinks, Main Courses"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetForms}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={mode === 'add-category' ? handleAddCategory : handleUpdateCategory}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {mode === 'add-category' ? 'Add Category' : 'Update Category'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Item Form */}
          {(mode === 'add-item' || mode === 'edit-item') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-500" />
                  {mode === 'add-item' ? 'Add New Item' : 'Edit Item'}
                </h3>
                <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder="e.g., Cold Coffee"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      placeholder="150"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Optional description or ingredients"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative w-12 h-6 rounded-full transition-colors ${itemForm.isVeg ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${itemForm.isVeg ? 'translate-x-6' : ''}`}></div>
                      <input
                        type="checkbox"
                        checked={itemForm.isVeg}
                        onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                        className="sr-only"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-700">Vegetarian</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={itemForm.customizable}
                      onChange={(e) => setItemForm({
                        ...itemForm,
                        customizable: e.target.checked,
                        options: e.target.checked ? itemForm.options : []
                      })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="font-medium text-gray-700">Has size/options</span>
                  </label>
                </div>

                {/* Options Section */}
                {itemForm.customizable && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Options/Sizes
                      </label>
                      <button
                        onClick={addOption}
                        type="button"
                        className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {itemForm.options.map((option, index) => (
                        <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateOption(index, 'label', e.target.value)}
                              placeholder="e.g., Small, Medium"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                            />
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) => updateOption(index, 'price', e.target.value)}
                              placeholder="Price"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {itemForm.options.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Click "Add Option" to add sizes or variations
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={mode === 'add-item' ? handleAddItem : handleUpdateItem}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {mode === 'add-item' ? 'Add Item' : 'Update Item'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          {mode === 'view' && selectedCategory && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{getCurrentCategory()?.name}</h3>
                  <button
                    onClick={() => setMode('add-item')}
                    className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-300" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search items..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {getFilteredItems().length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No items yet</p>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'No items match your search' : 'Add your first item to this category'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setMode('add-item')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add First Item
                      </button>
                    )}
                  </div>
                ) : (
                  getFilteredItems().map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                            {item.isVeg ? (
                              <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-red-600 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              </div>
                            )}
                            {item.customizable && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                Multiple Options
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}

                          {item.options && item.options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.options.map((opt, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {opt.label}: ₹{opt.price}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">₹{item.price}</p>
                            {item.customizable && (
                              <p className="text-xs text-gray-500">Starting from</p>
                            )}
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditItem(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* No Category Selected */}
          {mode === 'view' && !selectedCategory && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <Package className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a category to manage items
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose a category from the left panel to view and manage its menu items,
                  or create a new category to get started.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      resetForms();
                      setMode('add-category');
                    }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Category
                  </button>

                  {Object.keys(menuData || {}).length > 0 && (
                    <button
                      onClick={() =>
                        setSelectedCategory(Object.keys(menuData)[0])
                      }
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Select Existing Category
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
