function AboutUs() {
  const me = {};

  me.contactListener = () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const contactData = {
        name: formData.get("field1"),
        email: formData.get("field2"),
        message: formData.get("field3"),
      };

      try {
        const response = await fetch("/apiAboutUs/user-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        });
        if (response.ok) {
          displayMessage(
            "Thank you for your message. We will get back to you soon.",
            30000
          ); // 30 seconds
          form.reset(); // Optional: Reset the form after successful submission
        } else {
          displayMessage("An error occurred. Please try again later.", 30000); // 30 seconds
        }
      } catch (error) {
        console.error("Error sending message:", error);
        displayMessage("An error occurred. Please try again later.", 30000); // 30 seconds
      }
    });
  };

  const displayMessage = (message, duration) => {
    const messageBox = document.createElement("div");
    messageBox.textContent = message;
    messageBox.classList.add("message");
    document.body.appendChild(messageBox);
    setTimeout(() => { // i like how you use setTimeout() to remove the pop-up message box
      messageBox.remove();
    }, duration);
  };

  return me;
}

const aboutUs = AboutUs();

aboutUs.contactListener();
