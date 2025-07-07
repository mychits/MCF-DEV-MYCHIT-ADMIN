import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiPrinter } from "react-icons/bi";
import { useParams } from "react-router-dom";
import api from "../instance/TokenInstance";
import mychitsLogo from "../assets/images/mychits.png"; 

const RegistrationReceipt = () => {
    const { id } = useParams()
    const [payment, setPayment] = useState({});

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const response = await api.get(`/registration-fee/get-registration-fee-receipt-by-id/${id}`);
                if (response.data) {
                    console.log(response.data);
                    setPayment(response.data);
                } else {
                    setPayment({});
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
                setPayment({});
            }
        };

        fetchPayment();
    }, [id]);

    useEffect(() => {
        console.log(payment);
    }, [payment]);

    const formatPayDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handlePrint = async () => {
        const receiptElement = document.getElementById("receipt");
        const canvas = await html2canvas(receiptElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("portrait", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save("Receipt.pdf");
    };

    return (
        <div align="center" style={{ marginTop: "80px" }}>
            <button
                onClick={handlePrint}
                className="border border-blue-400 text-white px-4 py-2 mb-5 rounded-md shadow hover:border-blue-700 transition duration-200 mt-4"
            >
                <BiPrinter color="blue" />
            </button>
            <div
                id="receipt"
                style={{
                    width: "210mm",
                    height: "297mm",
                    padding: "10mm",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: "10mm",
                }}
            >
                <div
                    style={{
                        width: "48%",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "15px",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                    }}
                >    <img
  src={mychitsLogo}
  alt="Company Logo"
  width="40"
  style={{ margin: "0 auto 8px", display: "block" }}
/>
                    <h2 style={{ textAlign: "center", margin: 0 }}>MY CHITS</h2>
                    <p style={{ textAlign: "center", fontSize: "12px", margin: "5px 0" }}>
                        No.11/36-25, 2nd Main, Kathriguppe Main Road,
                        <br />
                        Bangalore, 560085 9483900777
                    </p>
                    <hr />
                    <h3 style={{ textAlign: "center", margin: "5px 0" }}>Receipt</h3>
                    <div style={{ textAlign: "start" }}>
                        <p>Receipt No: {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}</p>
                        <p>Date: {formatPayDate(payment.pay_date)}</p>
                        <div style={{marginTop:"4px"}}></div>
                        <p>Name: {payment?.user_id?.full_name}</p>
                        <p>Mobile No: {payment?.user_id?.phone_number}</p>
                        <div style={{marginTop:"4px"}}></div>
                        <p>Group: {payment?.group_id?.group_name}</p>
                        <p>Ticket: {payment?.ticket}</p>
                    </div>
                    <div
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            border: "1px solid #000",
                            padding: "10px",
                            margin: "10px 0",
                        }}
                    >
                        Received Amount | Rs.{payment?.amount}
                    </div>
                    <div style={{ textAlign: "start" }}>
                        <p>Mode: {payment?.pay_type}</p>
                        <p>Total: Rs.{payment?.amount}</p>
                        <p>Collected by: {payment?.collected_by?.name || "Admin"}</p>
                    </div>
                    <div style={{marginTop:"4px"}}></div>
                    <p>Customer Copy</p>
                </div>

                {/* Right Section */}
                <div
                    style={{
                        width: "48%",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "15px",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                    }}
                >
                     <img
  src={mychitsLogo}
  alt="Company Logo"
  width="40"
  style={{ margin: "0 auto 8px", display: "block" }}
/>
                    <h2 style={{ textAlign: "center", margin: 0 }}>MY CHITS</h2>
                    <p style={{ textAlign: "center", fontSize: "12px", margin: "5px 0" }}>
                        No.11/36-25, 2nd Main, Kathriguppe Main Road,
                        <br />
                        Bangalore, 560085 9483900777
                    </p>
                    <hr />
                    <h3 style={{ textAlign: "center", margin: "5px 0" }}>Receipt</h3>
                    <div style={{ textAlign: "start" }}>
                        <p>Receipt No: {payment.receipt_no ? payment.receipt_no : payment.old_receipt_no}</p>
                        <p>Date: {formatPayDate(payment.pay_date)}</p>
                        <div style={{marginTop:"4px"}}></div>
                        <p>Name: {payment?.user_id?.full_name}</p>
                        <p>Mobile No: {payment?.user_id?.phone_number}</p>
                        <div style={{marginTop:"4px"}}></div>
                        <p>Group: {payment?.group_id?.group_name}</p>
                        <p>Ticket: {payment?.ticket}</p>
                    </div>
                    <div
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            border: "1px solid #000",
                            padding: "10px",
                            margin: "10px 0",
                        }}
                    >
                        Received Amount | Rs.{payment?.amount}
                    </div>
                    <div style={{ textAlign: "start" }}>
                        <p>Mode: {payment?.pay_type}</p>
                        <p>Total: Rs.{payment?.amount}</p>
                        <p>Collected by: {payment?.collected_by?.name || "Admin"}</p>
                    </div>
                    <div style={{marginTop:"4px"}}></div>
                    <p>Admin Copy</p>
                </div>
            </div>

            {/* Print Button */}

        </div>
    );
};

export default RegistrationReceipt;
