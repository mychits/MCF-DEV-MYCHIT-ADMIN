import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiPrinter } from "react-icons/bi";
import { useParams } from "react-router-dom";
import api from "../instance/TokenInstance";
import mychitsLogo from "../assets/images/mychits.png";
import "./mycss.css"

const ReceiptComponent = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState({});
  const [loading, setLoading] = useState(true);
  const [printFormat, setPrintFormat] = useState('vertical'); // 'vertical' or 'horizontal'

  useEffect(() => {
    const fetchPayment = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/payment/get-payment-by-id/${id}`);
        setPayment(response.data || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  const formatPayDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = async () => {
    if (printFormat === 'vertical') {
      window.print();
    } else if (printFormat === 'horizontal'){
     
      window.print();
    }
  };

  // Vertical Receipt Component
  const VerticalReceiptSection = ({ copyType }) => (
    <div className="pro-receipt">
      <div className="pro-header">
        <div className="pro-left">
          <img src={mychitsLogo} className="pro-logo" alt="" />
          <div>
            <h2 className="pro-company">MY CHITS</h2>
            <p className="pro-address">
              No.11/36-25, Kathriguppe Main Road,
              <br />
              Bangalore - 560085 | 9483900777
            </p>
          </div>
        </div>
      </div>

      <div className="pro-title">PAYMENT RECEIPT</div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Receipt No:</span>
            <span>{payment.receipt_no || payment.old_receipt_no}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Date:</span>
            <span>{formatPayDate(payment.pay_date)}</span>
          </div>
        </div>

        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Name:</span>
            <span>{payment?.user_id?.full_name}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Mobile:</span>
            <span>{payment?.user_id?.phone_number}</span>
          </div>
        </div>

        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Group:</span>
            <span>{payment?.group_id?.group_name}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Ticket:</span>
            <span>{payment?.ticket}</span>
          </div>
        </div>
      </div>

      <div className="pro-amount-box">
        <span className="lbl">Received Amount:</span>
        <span className="val">₹ {payment?.amount}</span>
      </div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Payment Mode:</span>
            <span>{payment?.pay_type}</span>
          </div>
          <div className="pro-item">
            <span className="lbl">Collected By:</span>
            <span>{payment?.collected_by?.name || "Admin"}</span>
          </div>
        </div>
      </div>

      <div className="pro-footer">
        <div className="sign">Authorized Signature</div>
      </div>

      <div className="pro-type-box">{copyType} Copy</div>
    </div>
  );

  // Horizontal Receipt Component
  const HorizontalReceiptSection = ({ copyType }) => (
    <div className="pro-receipt">
      <div className="pro-header">
        <div className="pro-center">
          <img src={mychitsLogo} className="pro-logo" />
          <div>
            <h2 className="pro-company">MY CHITS</h2>
            <p className="pro-address">
              No.11/36-25, 2nd Main, Kathriguppe Main Road,<br />
              Bangalore - 560085 | 9483900777
            </p>
          </div>
        </div>
       
      </div>

      <div className="pro-title">PAYMENT RECEIPT</div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Receipt No:</span>
            <span>{payment.receipt_no || payment.old_receipt_no}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Name:</span>
            <span>{payment?.user_id?.full_name}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Date:</span>
            <span>{formatPayDate(payment.pay_date)}</span>
          </div>
        </div>

        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Mobile:</span>
            <span>{payment?.user_id?.phone_number}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Group:</span>
            <span>{payment?.group_id?.group_name}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Ticket:</span>
            <span>{payment?.ticket}</span>
          </div>
        </div>
      </div>

      <div className="pro-amount-box">
        <span className="lbl">Received Amount:</span>
        <span className="val">₹ {payment?.amount}</span>
      </div>

      <div className="pro-box">
        <div className="pro-row">
          <div className="pro-item">
            <span className="lbl">Payment Mode:</span>
            <span>{payment?.pay_type}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Collected By:</span>
            <span>{payment?.collected_by?.name || "Admin"}</span>
          </div>

          <div className="pro-item">
            <span className="lbl">Total:</span>
            <span>₹ {payment?.amount}</span>
          </div>
        </div>
      </div>
       

      <div className="pro-footer">
        
        <div className="sign">Authorized Signature</div>
      </div>
      <div className="pro-type-box">{copyType} Copy</div>
    </div>
  );

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading receipt details...</p>
      </div>
    );

  return (
    <div className="receipt-container">
      <div className="print-options-container">
        <div className="print-button-container">
          <button onClick={handlePrint} className="print-button">
            <BiPrinter size={20} /> Print Receipt
          </button>
        </div>
        
        <div className="format-selector">
          <label className="radio-label">
            <input
              type="radio"
              value="vertical"
              checked={printFormat === 'vertical'}
              onChange={() => setPrintFormat('vertical')}
            />
            Format 1
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="horizontal"
              checked={printFormat === 'horizontal'}
              onChange={() => setPrintFormat('horizontal')}
            />
            Format 2
          </label>
        </div>
      </div>

      {printFormat === 'vertical' ? (
        // Vertical Format
        <div className="vertical-format">
          {/* EXACT HALF-A4 SECTION */}
          <div className="receipt-wrapper">
            <div className="side-by-side">
              <VerticalReceiptSection copyType="Duplicate" />
              <VerticalReceiptSection copyType="Customer" />
            </div>
          </div>

          {/* EMPTY REMAINING 50% A4 */}
          <div className="a4-bottom-empty"></div>
        </div>
      ) : (
        // Horizontal Format
        <div id="receipt-to-print" className="receipt-wrapper horizontal-format">
          <HorizontalReceiptSection copyType="Duplicate" />
          <HorizontalReceiptSection copyType="Customer" />
          <div className="a4-bottom-empty"></div>
        </div>
      )}
    </div>
  );
};










export default ReceiptComponent;
