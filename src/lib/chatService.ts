import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export const sendMessage = async (data: any) => {
  return await addDoc(collection(db, "messages"), {
    ...data,
    created_at: new Date()
  });
};