import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export type UserStatus = "approved" | "pending" | "rejected" | "disabled";

export interface UserAccessCheck {
  allowed: boolean;
  status: UserStatus | null;
  message: string;
}

/**
 * Check if a user has access to the app based on their Firestore status
 * @param userId - The user's unique ID (Firebase UID) 
 * @returns Object with access permission and status details
 */
export const checkUserAccess = async (userId: string): Promise<UserAccessCheck> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        allowed: false,
        status: null,
        message: "User profile not found. Please contact support."
      };
    }

    const userData = userSnap.data();
    const status: UserStatus = userData.status || "pending";

    switch (status) {
      case "approved":
        return {
          allowed: true,
          status: "approved",
          message: "Access granted"
        };
      
      case "pending":
        return {
          allowed: false,
          status: "pending",
          message: "Your account is pending admin approval. You'll receive an email once approved."
        };
      
      case "rejected":
        return {
          allowed: false,
          status: "rejected",
          message: "Your account access has been denied. Please contact support for more information."
        };
      
      case "disabled":
        return {
          allowed: false,
          status: "disabled",
          message: "Your account has been disabled. Please contact support."
        };
      
      default:
        return {
          allowed: false,
          status: null,
          message: `Unknown account status: ${status}`
        };
    }
  } catch (error) {
    console.error("Error checking user access:", error);
    return {
      allowed: false,
      status: null,
      message: "Error verifying your account. Please try again."
    };
  }
};
