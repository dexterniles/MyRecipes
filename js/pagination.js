/**
 * Pagination Utility
 * Handles pagination and lazy loading for recipe lists
 */

class Pagination {
    constructor(options = {}) {
        this.itemsPerPage = options.itemsPerPage || 20;
        this.currentPage = 1;
        this.totalItems = 0;
        this.totalPages = 0;
        this.items = [];
    }

    /**
     * Set total items
     * @param {number} total - Total number of items
     */
    setTotalItems(total) {
        this.totalItems = total;
        this.totalPages = Math.ceil(total / this.itemsPerPage);
    }

    /**
     * Get items for current page
     * @returns {Array} - Items for current page
     */
    getCurrentPageItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.items.slice(start, end);
    }

    /**
     * Get page info
     * @returns {Object} - Page information
     */
    getPageInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            start: (this.currentPage - 1) * this.itemsPerPage + 1,
            end: Math.min(this.currentPage * this.itemsPerPage, this.totalItems),
            hasNextPage: this.currentPage < this.totalPages,
            hasPrevPage: this.currentPage > 1
        };
    }

    /**
     * Go to next page
     * @returns {boolean} - True if successful
     */
    nextPage() {
        if (this.hasNextPage()) {
            this.currentPage++;
            return true;
        }
        return false;
    }

    /**
     * Go to previous page
     * @returns {boolean} - True if successful
     */
    prevPage() {
        if (this.hasPrevPage()) {
            this.currentPage--;
            return true;
        }
        return false;
    }

    /**
     * Go to specific page
     * @param {number} page - Page number
     * @returns {boolean} - True if successful
     */
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    }

    /**
     * Check if has next page
     * @returns {boolean}
     */
    hasNextPage() {
        return this.currentPage < this.totalPages;
    }

    /**
     * Check if has previous page
     * @returns {boolean}
     */
    hasPrevPage() {
        return this.currentPage > 1;
    }

    /**
     * Reset to first page
     */
    reset() {
        this.currentPage = 1;
    }

    /**
     * Set items
     * @param {Array} items - Items to paginate
     */
    setItems(items) {
        this.items = items;
        this.setTotalItems(items.length);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Pagination = Pagination;
}

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}
