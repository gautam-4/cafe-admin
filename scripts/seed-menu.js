import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menuData = {
  drinks: {
    name: "Drinks",
    order: 1,
    items: [
      {
        id: 1,
        name: "Cold Coffee",
        price: 150,
        customizable: false,
        isVeg: true,
        description: "",
      },
      {
        id: 2,
        name: "Iced Tea",
        price: 100,
        customizable: true,
        isVeg: true,
        description: "",
        options: [
          { id: "lemon", label: "Lemon", price: 100 },
          { id: "peach", label: "Peach", price: 100 },
        ],
      },
    ],
  },

  "main-courses": {
    name: "Main Courses",
    order: 2,
    items: [
      {
        id: 3,
        name: "Peppy Paneer Pizza",
        price: 250,
        customizable: true,
        isVeg: true,
        description: "cheese, paneer, paprika",
        options: [
          { id: "small", label: 'Small (8")', price: 250 },
          { id: "medium", label: 'Medium (12")', price: 300 },
          { id: "large", label: 'Large (16")', price: 350 },
        ],
      },
      {
        id: 4,
        name: "Grilled Chicken",
        price: 250,
        customizable: false,
        isVeg: false,
        description: "",
      },
      {
        id: 5,
        name: "Pasta",
        price: 200,
        customizable: true,
        isVeg: true,
        description: "",
        options: [
          { id: "alfredo", label: "Alfredo", price: 200 },
          { id: "full", label: "Full Portion", price: 300 },
        ],
      },
    ],
  },

  desserts: {
    name: "Desserts",
    order: 3,
    items: [
      {
        id: 6,
        name: "Chocolate Cake",
        price: 150,
        customizable: true,
        isVeg: true,
        description: "",
        options: [
          { id: "slice", label: "Single Slice", price: 150 },
          { id: "double", label: "Double Slice", price: 200 },
        ],
      },
      {
        id: 7,
        name: "Ice Cream",
        price: 150,
        customizable: false,
        isVeg: true,
        description: "",
      },
    ],
  },
};

async function seed() {
  for (const [id, data] of Object.entries(menuData)) {
    await setDoc(doc(db, "menu", id), data);
  }
  console.log("Menu seeded successfully");
}

seed();
