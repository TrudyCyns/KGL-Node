document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/me')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById('user-firstname').textContent = data.firstname;
    })
    .catch((err) => {
      document.getElementById('user-firstname').textContent = '';
      console.error(err);
    });
});
