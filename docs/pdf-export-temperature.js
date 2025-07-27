document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("exportTemperaturePDF");
  if (!exportBtn) return;

  exportBtn.addEventListener("click", () => {
    const entryDivs = document.querySelectorAll("#temperatureList > div");
    if (entryDivs.length === 0) {
      alert("Nessuna temperatura registrata da esportare.");
      return;
    }

    const headers = ["Posizione", "Temperatura", "Orario"];
    const rows = [];

    entryDivs.forEach(div => {
      const position = div.querySelector("strong")?.innerText.trim() || "";
      const temp = div.querySelector(".text-xl.font-bold")?.innerText.trim() || "";
      const time = div.querySelector(".text-xs.text-gray-500")?.innerText.trim() || "";
      rows.push([position, temp, time]);
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Report: Temperature", 14, 22);

    doc.autoTable({
      startY: 30,
      head: [headers],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] }
    });

    const fileName = `report_Temperature_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  });
});