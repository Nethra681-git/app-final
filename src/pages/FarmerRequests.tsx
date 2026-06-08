import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc
} from "firebase/firestore";

const FarmerRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const farmerId = "farmer123"; // replace with logged-in farmer ID

  // 🔥 Fetch Requests
  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "requests"),
        where("farmer_id", "==", farmerId)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 🔥 Reply Function
  const handleReply = async (request: any) => {
    const price = prompt("Enter price per kg");
    if (!price) return;

    const message = prompt("Enter message");
    if (!message) return;

    try {
      // Save response
      await addDoc(collection(db, "responses"), {
        request_id: request.id,
        farmer_price: Number(price),
        message,
        created_at: new Date()
      });

      alert("Reply sent!");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Farmer Requests</h2>

      {requests.length === 0 && <p>No requests found</p>}

      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px"
          }}
        >
          <p><b>Product ID:</b> {req.product_id}</p>
          <p><b>Quantity:</b> {req.quantity}</p>
          <p><b>Message:</b> {req.message}</p>
          <p><b>Status:</b> {req.status}</p>

          <button onClick={() => handleReply(req)}>
            Reply
          </button>
        </div>
      ))}
    </div>
  );
};

export default FarmerRequests;