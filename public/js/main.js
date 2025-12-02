document.addEventListener('DOMContentLoaded', () => {
    // Remove any previously attached listeners first (safety)
    document.querySelectorAll('.delete-movie').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });

    // Add listeners to delete buttons
    document.querySelectorAll('.delete-movie').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();

            const btn = e.currentTarget;
            const movieId = btn.dataset.id;

            if (!confirm("Are you sure you want to delete this movie?")) return; // stops if canceled

            try {
                const res = await fetch(`/movies/${movieId}`, { method: 'DELETE' });
                if (res.ok) {
                    window.location.href = "/movies"; // redirect to list
                } else {
                    alert("Failed to delete movie");
                }
            } catch (err) {
                console.error(err);
            }
        });
    });
});
