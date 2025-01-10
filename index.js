const express = require("express");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Create a folder for storing bills if it doesn't exist

// function generateBillPDF(billData) {
//   // const { jsPDF } = window.jspdf;

//   // Save PDF
//   doc.save("bill.pdf");
// }

const billFolder = path.join(__dirname, "bills");
if (!fs.existsSync(billFolder)) {
  fs.mkdirSync(billFolder);
}

function numberToWords(number) {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "ten",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const scales = ["", "thousand", "million", "billion"];

  // Handle zero
  if (number === 0) return "zero";

  // Helper function to convert numbers less than 1000
  function convertHundreds(num) {
    let result = "";

    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " hundred ";
      num %= 100;
    }

    if (num >= 11 && num <= 19) {
      result += teens[num - 11] + " ";
    } else if (num >= 10) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }

    if (num > 0) {
      result += ones[num] + " ";
    }

    return result.trim();
  }

  let words = "";
  let scaleIndex = 0;

  while (number > 0) {
    const chunk = number % 1000;

    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      words =
        chunkWords +
        (scales[scaleIndex] ? " " + scales[scaleIndex] : "") +
        " " +
        words;
    }

    number = Math.floor(number / 1000);
    scaleIndex++;
  }

  return words.trim();
}

app.post("/generate-bill", (req, res) => {
  const { billItems } = req.body;

  const billData = billItems.map((item, index) => {
    const sno = index + 1; // Serial number starts at 1
    const name = item.name;
    const qty = item.quantity;
    const gst = item.gstRate;
    const rate = item.price;
    const amount = rate * qty; // Total amount = MRP * Quantity

    return { sno, name, qty, gst, rate, amount };
  });

  console.log(billData);
  const amount = billData.reduce((total, item) => total + item.amount, 0);
  console.log(amount);
  const doc = new jsPDF();

  const wordamount = numberToWords(amount);

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SALE BILL", 105, 20, null, null, "center");
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TANVI ENTERPRISES", 105, 35, null, null, "center");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    "GROUND, SHOP NO 01 SHREEGANESH, BUILDING NR SMG",
    105,
    45,
    null,
    null,
    "center"
  );
  doc.text("THANE, MAHARASHTRA 400612", 105, 50, null, null, "center");
  doc.text("MOBILE : 9876543210", 105, 55, null, null, "center");
  doc.text("GSTIN : ABC", 105, 60, null, null, "center");

  doc.line(20, 65, 190, 65);

  // Customer Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer:", 20, 75);
  doc.setFont("helvetica", "normal");
  doc.text("Abhijeet Gupta", 50, 75);
  doc.setFont("helvetica", "bold");
  doc.text("Address :", 20, 80);
  doc.setFont("helvetica", "bold");
  doc.text("Shyam Nagar, By pass chauraha", 50, 80);
  doc.text("invoice no.:", 150, 75);
  doc.setFont("helvetica", "bold");
  doc.text("0000218", 150, 80);
  doc.text("invoice date: 12/12/2024", 150, 85);
  doc.setFont("helvetica", "bold");
  doc.text("invoice time.: 01:30", 150, 90);
  doc.setFont("helvetica", "bold");
  doc.setFont("helvetica", "bold");
  doc.text("mobile no.", 20, 85);
  doc.setFont("helvetica", "normal");
  doc.text("8887838118", 50, 85);

  // Table Headers
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("S. No.", 25, 105, null, null, "center");
  doc.text("Product", 60, 105, null, null, "center");
  doc.text("Qty", 95, 105, null, null, "center");
  doc.text("GST %", 115, 105, null, null, "center");
  doc.text("RATE A", 140, 105, null, null, "center");
  doc.text("AMOUNT", 175, 105, null, null, "center");

  // Draw table header borders
  doc.rect(20, 100, 10, 10);
  doc.rect(30, 100, 60, 10);
  doc.rect(90, 100, 20, 10);
  doc.rect(110, 100, 20, 10);
  doc.rect(130, 100, 30, 10);
  doc.rect(160, 100, 30, 10);

  // Table Content
  let yPosition = 110;
  doc.setFont("helvetica", "normal");
  billData.forEach((item) => {
    doc.text(String(item.sno), 25, yPosition + 7, null, null, "center");
    doc.text(item.name, 60, yPosition + 7, null, null, "center");
    doc.text(String(item.qty), 95, yPosition + 7, null, null, "center");
    doc.text(String(item.gst), 115, yPosition + 7, null, null, "center");
    doc.text(String(item.rate), 140, yPosition + 7, null, null, "center");
    doc.text(String(item.amount), 175, yPosition + 7, null, null, "center");

    // Draw row borders
    doc.rect(20, yPosition, 10, 10);
    doc.rect(30, yPosition, 60, 10);
    doc.rect(90, yPosition, 20, 10);
    doc.rect(110, yPosition, 20, 10);
    doc.rect(130, yPosition, 30, 10);
    doc.rect(160, yPosition, 30, 10);

    yPosition += 10;
  });

  // SGST and Grand Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SGST : 10094", 175, yPosition + 10, null, null, "center");
  doc.text(
    `GRAND TOTAL : ${amount}`,
    170,
    yPosition + 20,
    null,
    null,
    "center"
  );
  doc.setFont("helvetica", "normal");
  // doc.line(20, 65, 190, 65);
  doc.line(20, yPosition + 25, 190, yPosition + 25);
  doc.text(`Total (${wordamount} only)`, 20, yPosition + 30);
  doc.line(20, yPosition + 33, 190, yPosition + 33);

  // Terms and Conditions
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Terms and conditions", 20, yPosition + 45);
  doc.setFont("helvetica", "bold");
  doc.text("GPAY : 8887838118", 20, yPosition + 55);

  const fileName = `bill_${Date.now()}.pdf`;
  const filePath = path.join(billFolder, fileName);
  fs.writeFileSync(filePath, Buffer.from(doc.output("arraybuffer")));

  console.log("Bill generated successfully");
  console.log(`/bills/${fileName}`);
  res.json({
    message: "Bill generated successfully",
    filePath: `/bills/${fileName}`,
  });
});

app.use("/bills", express.static(billFolder));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
