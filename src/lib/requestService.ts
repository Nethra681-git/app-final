import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export const createRequest = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, "requests"), {
      ...data,
      status: "pending",
      created_at: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating request:", error);
  }
};