import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

export function useMenu() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // Fetch menu
  // =========================
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'menu'));

        const menu = {};
        snapshot.forEach(docSnap => {
          menu[docSnap.id] = docSnap.data();
        });

        const sorted = Object.keys(menu)
          .sort((a, b) => (menu[a].order ?? 0) - (menu[b].order ?? 0))
          .reduce((acc, key) => {
            acc[key] = menu[key];
            return acc;
          }, {});

        setMenuData(sorted);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // =========================
  // CATEGORY CRUD
  // =========================
  const addCategory = async (categoryId, data) => {
    const newCategory = {
      name: data.name,
      order: data.order ?? 0,
      items: []
    };

    await setDoc(doc(db, 'menu', categoryId), newCategory);

    setMenuData(prev => ({
      ...prev,
      [categoryId]: newCategory
    }));
  };

  const updateCategory = async (categoryId, updates) => {
    await updateDoc(doc(db, 'menu', categoryId), updates);

    setMenuData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        ...updates
      }
    }));
  };

  const deleteCategory = async (categoryId) => {
    await deleteDoc(doc(db, 'menu', categoryId));

    setMenuData(prev => {
      const copy = { ...prev };
      delete copy[categoryId];
      return copy;
    });
  };

  // =========================
  // ITEM CRUD (ARRAY REWRITE)
  // =========================
  const sanitizeItem = (item) => ({
    ...item,
    price: Number(item.price),
    options: item.options
      ? item.options.map(o => ({
        ...o,
        price: Number(o.price)
      }))
      : []
  });

  const addItem = async (categoryId, item) => {
    const category = menuData[categoryId];
    const cleanItem = sanitizeItem(item);
    const items = [...category.items, cleanItem];

    await updateDoc(doc(db, 'menu', categoryId), { items });

    setMenuData(prev => ({
      ...prev,
      [categoryId]: { ...category, items }
    }));
  };



  const updateItem = async (categoryId, itemId, updates) => {
    const category = menuData[categoryId];

    const items = category.items.map(item =>
      item.id === itemId
        ? sanitizeItem({ ...item, ...updates })
        : item
    );

    await updateDoc(doc(db, 'menu', categoryId), { items });

    setMenuData(prev => ({
      ...prev,
      [categoryId]: { ...category, items }
    }));
  };


  const deleteItem = async (categoryId, itemId) => {
    const category = menuData[categoryId];
    const items = category.items.filter(item => item.id !== itemId);

    await updateDoc(doc(db, 'menu', categoryId), { items });

    setMenuData(prev => ({
      ...prev,
      [categoryId]: { ...category, items }
    }));
  };

  return {
    menuData,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem
  };
}
