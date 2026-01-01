let showHidden = false;let visibleLimit = 10;


let patients = JSON.parse(localStorage.getItem("patients")) || [];
let editingIndex = null;

// Also render past follow-ups section if visible
function displayPastFollowups() {
    const pastList = document.getElementById('pastList');
    const emptyPast = document.getElementById('emptyPast');
    if (!pastList) return;

    pastList.innerHTML = '';

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let past = patients.filter(p => p.followup && new Date(p.followup) < todayStart);
    // Sort descending (most recent past first)
    past.sort((a, b) => new Date(b.followup) - new Date(a.followup));

    emptyPast.style.display = past.length === 0 ? 'block' : 'none';

    past.forEach(p => {
        let li = document.createElement('li');
        li.style.marginBottom = '12px';

        let title = document.createElement('div');
        title.style.display = 'flex';
        title.style.justifyContent = 'space-between';
        title.style.alignItems = 'center';

        let left = document.createElement('div');
        const mobileLink = p.mobile ? `<a href="tel:${p.mobile}">${p.mobile}</a>` : 'NA';
        left.innerHTML = `<strong>${p.name}</strong> (${p.age}) — ${mobileLink}`;

        let right = document.createElement('div');
        let status = p.followupStatus || '';
        let badgeClass = status === 'completed' ? 'status-completed' : status === 'rescheduled' ? 'status-rescheduled' : status === 'not_completed' ? 'status-not' : '';
        let badgeText = status ? status.replace('_',' ') : 'Pending';
        right.innerHTML = `<span class="status-badge ${badgeClass}">${badgeText}</span>`;

        title.appendChild(left);
        title.appendChild(right);

        let details = document.createElement('div');
        details.className = 'patient-details';
        details.style.display = 'block';
        details.innerHTML = `
            <b>Sex:</b> ${p.sex}<br>
            <b>Mobile:</b> ${mobileLink}<br>
            <b>Diagnosis:</b> ${p.diagnosis}<br>
            <b>Notes:</b> ${p.notes || ''}<br>
            <b>Follow-up:</b> ${p.followup}<br>
        `;

        let actions = document.createElement('div');
        actions.className = 'past-actions';

        let editBtn = document.createElement('button');
        editBtn.className = 'btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editPatient(patients.indexOf(p));

        let doneBtn = document.createElement('button');
        doneBtn.className = 'btn';
        doneBtn.textContent = 'Mark Completed';
        doneBtn.onclick = () => markFollowupStatus(patients.indexOf(p), 'completed');

        let resBtn = document.createElement('button');
        resBtn.className = 'btn';
        resBtn.textContent = 'Reschedule';
        resBtn.onclick = () => markFollowupStatus(patients.indexOf(p), 'rescheduled');

        let notBtn = document.createElement('button');
        notBtn.className = 'btn ghost';
        notBtn.textContent = 'Not Completed';
        notBtn.onclick = () => markFollowupStatus(patients.indexOf(p), 'not_completed');

        actions.appendChild(editBtn);
        actions.appendChild(doneBtn);
        actions.appendChild(resBtn);
        actions.appendChild(notBtn);

        li.appendChild(title);
        li.appendChild(details);
        li.appendChild(actions);

        pastList.appendChild(li);
    });
}

function togglePastFollowups() {
    const section = document.getElementById('pastFollowups');
    const btn = document.getElementById('togglePastBtn');
    if (!section) return;
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        btn.textContent = 'Hide Past Follow-ups';
        displayPastFollowups();
    } else {
        section.style.display = 'none';
        btn.textContent = 'Show Past Follow-ups';
    }
}

function markFollowupStatus(index, status) {
    if (index < 0 || index >= patients.length) return;
    const p = patients[index];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (status === 'rescheduled') {
        const newDate = prompt('Enter new follow-up date (YYYY-MM-DD):', p.followup || todayStr);
        if (!newDate) return;
        const nd = new Date(newDate);
        if (isNaN(nd.getTime())) { alert('Invalid date format'); return; }
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (nd < todayStart) { alert('Rescheduled date must be today or later'); return; }
        p.followup = newDate;
        p.followupStatus = 'rescheduled';
    } else if (status === 'completed') {
        p.followupStatus = 'completed';
        p.completedOn = todayStr;
    } else if (status === 'not_completed') {
        p.followupStatus = 'not_completed';
    }

    localStorage.setItem('patients', JSON.stringify(patients));
    displayPatients();
    displayPastFollowups();
}

function editPatient(index) {
    if (index < 0 || index >= patients.length) return;
    const p = patients[index];
    document.getElementById('visitDate').value = p.visitDate || '';
    document.getElementById('name').value = p.name || '';
    document.getElementById('followup').value = p.followup || '';
    const mobileEl = document.getElementById('mobile');
    if (mobileEl) { mobileEl.value = p.mobile || ''; mobileEl.readOnly = false; }
    document.getElementById('age').value = p.age || '';
    document.getElementById('sex').value = p.sex || '';
    document.getElementById('diagnosis').value = p.diagnosis || '';

    editingIndex = index;
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.textContent = 'Update Patient';

    // when editing, clear the "save contact" checkbox - only save new contacts explicitly
    const saveContactCheckbox = document.getElementById('saveContact'); if (saveContactCheckbox) saveContactCheckbox.checked = false;

    document.getElementById('form').style.display = 'block';
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.focus();
}

function cancelEdit() {
    editingIndex = null;
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.textContent = '💾 Save Patient';
    // clear form fields
    const fields = ['visitDate','name','followup','mobile','age','sex','diagnosis'];
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const mobileInput = document.getElementById('mobile'); if (mobileInput) mobileInput.readOnly = true;
    const saveContactCheckbox = document.getElementById('saveContact'); if (saveContactCheckbox) saveContactCheckbox.checked = false;
    document.getElementById('form').style.display = 'none';
}
function showForm() {
    document.getElementById("form").style.display = "block";
    const mobileEl = document.getElementById('mobile'); if (mobileEl) mobileEl.readOnly = true;
    const saveContactCheckbox = document.getElementById('saveContact'); if (saveContactCheckbox) saveContactCheckbox.checked = false;
}

// Theme handling: apply saved theme or default
function setTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // tweak logo emoji per theme for friendly feel
    const logo = document.querySelector('.logo');
    if (logo) {
        if (theme === 'panda') logo.textContent = '🐼';
        else if (theme === 'light') logo.textContent = '🩺';
        else if (theme === 'windows') logo.textContent = '📱';
        else logo.textContent = '🩺';
    }
    const selector = document.getElementById('themeSelector');
    if (selector) selector.value = theme;
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
}

// initialize theme on load
document.addEventListener('DOMContentLoaded', initTheme);

// Non-blocking inline notice (toast)
function showNotice(message, timeout = 3000) {
    const n = document.createElement('div');
    n.className = 'notice';
    n.textContent = message;
    document.body.appendChild(n);
    // force reflow to allow transition
    void n.offsetWidth;
    n.classList.add('show');
    setTimeout(() => {
        n.classList.remove('show');
        setTimeout(() => n.remove(), 300);
    }, timeout);
}

function savePatient() {
    let patient = {
        visitDate: document.getElementById("visitDate").value,
        name: document.getElementById("name").value,
        mobile: document.getElementById("mobile").value,
        age: document.getElementById("age").value,
        sex: document.getElementById("sex").value,
        diagnosis: document.getElementById("diagnosis").value,
        notes: document.getElementById("notes").value,
        followup: document.getElementById("followup").value
    };
if (patient.followup && patient.followup < patient.visitDate) {
    alert("Follow-up date cannot be before visit date");
    return;
}

    if (!patient.name || !patient.age || !patient.sex || !patient.diagnosis) {
        alert("Please fill all required fields");
        return;
    }

    // if editing, update existing record
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < patients.length) {
        patients[editingIndex] = patient;
    } else {
        patients.push(patient);
    }
    localStorage.setItem("patients", JSON.stringify(patients));

    // Optionally save contact to device when user checked the checkbox
    const saveContactCheckbox = document.getElementById('saveContact');
    if (saveContactCheckbox && saveContactCheckbox.checked) {
        try {
            saveContactToDevice(patient);
        } catch (err) {
            console.error('Saving contact failed', err);
        }
    }

    // Clear the inputs manually (the form is a div, not a <form>)
    const visitInput = document.getElementById("visitDate");
    const nameInput = document.getElementById("name");
    const followupInput = document.getElementById("followup");
    const mobileInput = document.getElementById("mobile");
    const ageInput = document.getElementById("age");
    const sexInput = document.getElementById("sex");
    const diagnosisInput = document.getElementById("diagnosis");
    const notesInput = document.getElementById("notes");

    if (nameInput) nameInput.value = "";
    if (visitInput) visitInput.value = "";
    if (followupInput) {
        followupInput.value = "";
        followupInput.min = "";
    }
    if (mobileInput) { mobileInput.value = ""; mobileInput.readOnly = true; }
    if (ageInput) ageInput.value = "";
    if (sexInput) sexInput.value = "";
    if (diagnosisInput) diagnosisInput.value = "";
    if (notesInput) notesInput.value = "";

    // Focus the first input for quick next entry
    if (visitInput) visitInput.focus();

    // reset editing state and button label
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.textContent = '💾 Save Patient';
    editingIndex = null;

    displayPatients();
    displayPastFollowups();
    showNotice('Patient saved');
}

function displayPatients() {
    let list = document.getElementById("patientList");
    let empty = document.getElementById("empty");
    let loadMoreBtn = document.getElementById("loadMoreBtn");

    list.innerHTML = "";

    if (patients.length === 0) {
        empty.style.display = "block";
        loadMoreBtn.style.display = "none";
        return;
    }

    // Show empty state only when there are no upcoming follow-ups
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Upcoming: followup on or after today
    let filtered = patients.filter(p => p.followup && new Date(p.followup) >= todayStart);

    // Sort by follow-up date ascending
    filtered.sort((a, b) => new Date(a.followup) - new Date(b.followup));

    empty.style.display = filtered.length === 0 ? "block" : "none";

    let shownCount = 0;
    let currentDateHeader = "";

    filtered.forEach(p => {
        if (shownCount >= visibleLimit) return;

        let followupDate = new Date(p.followup);
        let dateLabel = followupDate.toDateString();

        if (dateLabel !== currentDateHeader) {
            currentDateHeader = dateLabel;
            let h = document.createElement("h3");
            h.textContent = "📅 " + dateLabel;
            list.appendChild(h);
        }

        let btn = document.createElement("button");
        btn.className = "patient-btn";
        btn.textContent =
            p.name + " (" + p.age + ") - " + (p.mobile || "NA");

        const mobileLink = p.mobile ? `<a href="tel:${p.mobile}">${p.mobile}</a>` : 'NA';
        let details = document.createElement("div");
        details.className = "patient-details";
        details.innerHTML = `
            <b>Sex:</b> ${p.sex}<br>
            <b>Mobile:</b> ${mobileLink}<br>
            <b>Diagnosis:</b> ${p.diagnosis}<br>
            <b>Notes:</b> ${p.notes || ''}<br>
            <b>Follow-up:</b> ${p.followup}<br><br>
            <button onclick="this.parentElement.style.display='none'">Hide</button>
            <button onclick="editPatient(${patients.indexOf(p)})"
                style="background:#2e7d32;color:white;margin-left:10px;">
                Edit
            </button>
            <button onclick="removePatient(${patients.indexOf(p)})"
                style="background:#d32f2f;color:white;margin-left:10px;">
                Remove
            </button>
        `;

        btn.onclick = () => {
            details.style.display =
                details.style.display === "none" ? "block" : "none";
        };

        list.appendChild(btn);
        list.appendChild(details);

        shownCount++;
    });

    loadMoreBtn.style.display =
        visibleLimit < filtered.length ? "block" : "none";
}




displayPatients();
function removePatient(index) {
    let confirmDelete = confirm("Are you sure you want to remove this patient?");

    if (!confirmDelete) return;

    patients.splice(index, 1);
    localStorage.setItem("patients", JSON.stringify(patients));
    displayPatients();
}
function toggleHiddenPatients() {
    showHidden = !showHidden;

    document.getElementById("toggleHidden").textContent =
        showHidden ? "Hide Hidden Patients" : "Show Hidden Patients";

    displayPatients();
}
function exportCSV() {
    if (patients.length === 0) {
        alert("No data to export");
        return;
    }

    let csv =
        "Name,Age,Sex,Mobile,Notes,Diagnosis,Visit Date,Follow-up Date\n";

    patients.forEach(p => {
        csv +=
                `"${p.name}",` +
                `"${p.age}",` +
                `"${p.sex}",` +
                `"${p.mobile || ""}",` +
                `"${p.notes || ""}",` +
                `"${p.diagnosis}",` +
                `"${p.visitDate || ""}",` +
                `"${p.followup || ""}"\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "clinic_patients.csv";
    a.click();

    URL.revokeObjectURL(url);
}
function exportPDF() {
    if (patients.length === 0) {
        alert("No data to export");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Clinic Patient Records", 14, 15);

    let tableData = patients.map(p => [
        p.name,
        p.age,
        p.sex,
        p.mobile || "",
        p.notes || "",
        p.diagnosis,
        p.visitDate || "",
        p.followup || ""
    ]);

    doc.autoTable({
        startY: 25,
        head: [[
            "Name",
            "Age",
            "Sex",
            "Mobile",
            "Notes",
            "Diagnosis",
            "Visit Date",
            "Follow-up Date"
        ]],
        body: tableData
    });

    doc.save("clinic_patients.pdf");
}
function loadMorePatients() {
    visibleLimit += 10;
    displayPatients();
}
function setFollowupMinDate() {
    let visitDate = document.getElementById("visitDate").value;
    let followupInput = document.getElementById("followup");

    if (visitDate) {
        followupInput.min = visitDate;
    }
}

function chooseContact() {
    if (navigator.contacts && typeof navigator.contacts.select === 'function') {
        try {
            navigator.contacts.select(['name','tel'], {multiple:false})
            .then(contacts => {
                if (!contacts || contacts.length === 0) return;
                const c = contacts[0];
                const name = Array.isArray(c.name) ? c.name[0] : c.name || '';
                const tel = Array.isArray(c.tel) ? c.tel[0] : c.tel || '';
                if (name && document.getElementById('name')) document.getElementById('name').value = name;
                const mobileEl = document.getElementById('mobile');
                if (tel && mobileEl) { mobileEl.value = tel; mobileEl.readOnly = false; mobileEl.focus(); }
            })
            .catch(err => {
                console.error('Contact picker error', err);
                alert('Could not access contacts: ' + (err && err.message ? err.message : err));
            });
        } catch (err) {
            console.error(err);
            alert('Contact picker failed: ' + err.message);
        }
    } else {
        const modal = document.getElementById('contactModal');
        if (modal) modal.style.display = 'flex';
        else alert("Contact Picker not supported in this browser. Please enter the number manually.");
    }
}

function hideContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.style.display = 'none';
}

function enableManualMobile() {
    const mobile = document.getElementById('mobile');
    if (mobile) {
        mobile.removeAttribute('readonly');
        mobile.focus();
    }
    hideContactModal();
}

function saveContactToDevice(p) {
    if (!p || (!p.name && !p.mobile)) return;

    // If an API to programmatically save contacts exists, try it first (non-standard / experimental)
    if (navigator.contacts && typeof navigator.contacts.save === 'function') {
        try {
            navigator.contacts.save && navigator.contacts.save({name:[p.name || ''], tel:[p.mobile || '']})
            .then(() => showNotice('Contact saved to device.'))
            .catch(err => {
                console.warn('contacts.save failed, falling back to vCard', err);
                vcardFallback();
            });
            return;
        } catch (err) {
            console.warn('contacts.save threw', err);
            // fall through to vCard fallback
        }
    }

    // vCard fallback - downloads a .vcf which users can open on their device to save to contacts
    function vcardFallback() {
        const name = p.name || '';
        const tel = p.mobile || '';
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${tel}\nEND:VCARD`;
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(name || 'contact').replace(/\s+/g,'_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showNotice('vCard downloaded — open it on your device to save the contact');
    }

    vcardFallback();
}

// --- Custom export modal controls and range export functions ---
function showCustomExport() {
    const modal = document.getElementById('customExportModal');
    if (!modal) return;
    document.getElementById('customFrom').value = '';
    document.getElementById('customTo').value = '';
    modal.style.display = 'flex';
    document.getElementById('customFrom').focus();
}

function hideCustomExport() {
    const modal = document.getElementById('customExportModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function exportCustomCSV() {
    const from = document.getElementById('customFrom').value;
    const to = document.getElementById('customTo').value;
    if (!from || !to) { alert('Please select both start and end dates'); return; }
    if (new Date(to) < new Date(from)) { alert('End date must be on or after start date'); return; }
    exportCSVRange(from, to);
    hideCustomExport();
}

function exportCSVRange(fromDateStr, toDateStr) {
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);
    // include whole day for 'to'
    to.setHours(23,59,59,999);

    const filtered = patients.filter(p => p.followup && new Date(p.followup) >= from && new Date(p.followup) <= to);
    if (filtered.length === 0) { alert('No records in selected range'); return; }

    let csv = "Name,Age,Sex,Mobile,Notes,Diagnosis,Visit Date,Follow-up Date\n";
    filtered.forEach(p => {
        csv +=
            `"${p.name}",` +
            `"${p.age}",` +
            `"${p.sex}",` +
            `"${p.mobile || ""}",` +
            `"${p.notes || ""}",` +
            `"${p.diagnosis}",` +
            `"${p.visitDate || ""}",` +
            `"${p.followup || ""}"\n`;
    });

    let blob = new Blob([csv], { type: 'text/csv' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `clinic_patients_${fromDateStr}_to_${toDateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportCustomPDF() {
    const from = document.getElementById('customFrom').value;
    const to = document.getElementById('customTo').value;
    if (!from || !to) { alert('Please select both start and end dates'); return; }
    if (new Date(to) < new Date(from)) { alert('End date must be on or after start date'); return; }
    exportPDFRange(from, to);
    hideCustomExport();
}

// --- CSV import (backup / restore) ---
function triggerImportCSV() {
    const input = document.getElementById('importCsvInput');
    if (!input) return;
    input.value = '';
    input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            try {
                const parsed = parseCSV(text);
                if (!parsed || parsed.length === 0) { alert('No records found in CSV'); return; }
                const proceed = confirm('Importing will replace existing patient data. Continue?');
                if (!proceed) return;
                // Map parsed rows to patient objects
                const newPatients = parsed.map(row => {
                    // normalize keys lower-case
                    const obj = {};
                    for (const k in row) {
                        const key = k.trim().toLowerCase();
                        const v = row[k];
                        if (key.includes('name')) obj.name = v;
                        else if (key.includes('age')) obj.age = v;
                        else if (key.includes('sex')) obj.sex = v;
                        else if (key.includes('mobile')) obj.mobile = v;
                        else if (key.includes('note')) obj.notes = v;
                        else if (key.includes('diagnosis')) obj.diagnosis = v;
                        else if (key.includes('visit')) obj.visitDate = v;
                        else if (key.includes('follow')) obj.followup = v;
                        else obj[key] = v;
                    }
                    return obj;
                }).filter(p => p.name);

                // Save and refresh
                patients = newPatients;
                localStorage.setItem('patients', JSON.stringify(patients));
                displayPatients();
                displayPastFollowups();
                showNotice('Import completed — ' + patients.length + ' records restored.');
            } catch (err) {
                console.error(err);
                alert('Failed to parse CSV: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function parseCSV(text) {
    // Simple CSV parser that handles quoted fields and commas inside quotes
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];
    const headers = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = parseLine(line);
        // if cols fewer than headers, pad
        while (cols.length < headers.length) cols.push('');
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = cols[j] || '';
        }
        // skip empty rows
        const allEmpty = Object.values(obj).every(v => String(v).trim() === '');
        if (!allEmpty) rows.push(obj);
    }
    return rows;
}

function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += ch;
        }
    }
    result.push(cur);
    return result.map(s => s.trim());
}

function exportPDFRange(fromDateStr, toDateStr) {
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);
    to.setHours(23,59,59,999);

    const filtered = patients.filter(p => p.followup && new Date(p.followup) >= from && new Date(p.followup) <= to);
    if (filtered.length === 0) { alert('No records in selected range'); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`Clinic Patient Records (${fromDateStr} to ${toDateStr})`, 14, 15);

    let tableData = filtered.map(p => [
        p.name,
        p.age,
        p.sex,
        p.mobile || "",
        p.notes || "",
        p.diagnosis,
        p.visitDate || "",
        p.followup || ""
    ]);

    doc.autoTable({
        startY: 25,
        head: [["Name","Age","Sex","Mobile","Notes","Diagnosis","Visit Date","Follow-up Date"]],
        body: tableData
    });

    doc.save(`clinic_patients_${fromDateStr}_to_${toDateStr}.pdf`);
}
