function addRow() {
  const tableBody = document.getElementById("table-body");
  const newRow = document.createElement("tr");
  const newRowId = "new-row-" + Date.now();
  newRow.setAttribute("data-row-id", newRowId);
  newRow.innerHTML = `
    <td><input type="text" name="product_name" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 0)" /></td>
    <td><input type="text" name="product_number" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 1)" /></td>
    <td><input type="text" name="variant_name" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 2)" /></td>
    <td><input type="text" name="load_date" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 3)" /></td>
    <td><input type="text" name="gender" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 4)" /></td>
    <td><input type="text" name="code" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 5)" /></td>
    <td><input type="text" name="category" onkeydown="moveCursor(event, ${tableBody.childElementCount}, 6)" /></td>
    <td><button onclick="saveRowData(this)">Save</button></td>
    <td><button onclick="enableRowEditing(this)">Edit</button></td>
  `;

  tableBody.appendChild(newRow);

  const inputs = newRow.querySelectorAll("input");
  inputs.forEach((input) => {
    input.removeAttribute("disabled");
  });
}

function removeLastRow() {
  const tableBody = document.getElementById("table-body");
  const rows = tableBody.getElementsByTagName("tr");
  if (rows.length > 1) {
    tableBody.removeChild(rows[rows.length - 1]);
  } else {
    alert("Minimum one row is required");
  }
}

function saveRowData(button) {
  const row = button.parentElement.parentElement;
  const inputs = row.querySelectorAll("input");
  const data = {};

  inputs.forEach((input, index) => {
    const key = input.name;
    const value = input.value;
    data[key] = value;
    input.setAttribute("disabled", true);
  });

  const rowId = row.getAttribute("data-row-id");
  if (rowId) {
    data.id = rowId;
  }

  sendDataToServer(data, row);
}

function sendDataToServer(data, row) {
  fetch("http://localhost:3000/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          "Server returned an error:",
          response.status,
          response.statusText
        );
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((responseData) => {
      console.log("Response from server:", responseData);
      if (responseData.success) {
        alert("Data saved successfully!");
        if (!data.id) {
          row.setAttribute("data-row-id", responseData.id);
        }
        row.classList.remove("editing");
        row.classList.add("saved");
      } else {
        console.log("Server response indicates failure:", responseData);
        alert("Failed to save data!");

        const inputs = row.querySelectorAll("input");
        inputs.forEach((input) => {
          input.removeAttribute("disabled");
        });
      }
    })
    .catch((error) => {
      console.error("Error saving data:", error);
      alert("Failed to save data!");

      // Re-enable the input fields for the failed row
      const inputs = row.querySelectorAll("input");
      inputs.forEach((input) => {
        input.removeAttribute("disabled");
      });
    });
}

function enableRowEditing(button) {
  const row = button.parentElement.parentElement;
  const inputs = row.querySelectorAll("input");
  inputs.forEach((input) => {
    input.removeAttribute("disabled");
  });
  row.classList.add("editing");
  row.classList.remove("saved");
}

function moveCursor(event, rowIndex, cellIndex) {
  const tableBody = document.getElementById("table-body");
  const rows = tableBody.getElementsByTagName("tr");
  const currentInput = event.target;
  const currentRow = rows[rowIndex];
  const allInputs = currentRow.querySelectorAll("input");
  const totalInputs = allInputs.length;

  function moveToPreviousCell(index) {
    if (index >= 0) {
      const prevInput = allInputs[index];
      prevInput.focus();
    }
  }

  function isEmptyInput(input) {
    return input.value.trim() === "";
  }

  if (event.key === "Backspace" && isEmptyInput(currentInput)) {
    const currentIndex = Array.from(allInputs).indexOf(currentInput);

    if (currentIndex === 0) {
      const prevRow = rows[rowIndex - 1];
      if (prevRow) {
        const prevRowInputs = prevRow.querySelectorAll("input");
        moveToPreviousCell(prevRowInputs.length - 1);
      }
    } else {
      moveToPreviousCell(currentIndex - 1);
    }
  } else if (event.key === "Enter") {
    const nextIndex = (cellIndex + 1) % totalInputs;
    const nextRow = rows[rowIndex + 1];

    if (nextIndex === 0 && nextRow) {
      const nextRowInputs = nextRow.querySelectorAll("input");
      nextRowInputs[0].focus();
    } else {
      const nextInput = allInputs[nextIndex];
      nextInput.focus();
    }
  }
}
