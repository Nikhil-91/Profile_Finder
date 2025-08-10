function showInfrastructureModal(title, data) {
    const modalHTML = `
        <div class="modal fade" id="infrastructureModal" tabindex="-1" aria-labelledby="infrastructureModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="infrastructureModalLabel">${title} - Health Overview</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Metrics Section -->
                        <div class="card border-0 shadow-sm mb-4">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Performance Metrics</h6>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table id="metricsTable" class="table table-striped">
                                        <thead></thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Error Details Section -->
                        <div class="card border-0 shadow-sm">
                            <div class="card-header">
                                <h6 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i>Error Analysis</h6>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table id="errorTable" class="table table-striped table-sm">
                                        <thead></thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('infrastructureModal');
    if (existingModal) {
        const modalInstance = bootstrap.Modal.getInstance(existingModal);
        if (modalInstance) {
            modalInstance.hide();
            modalInstance.dispose();
        }
        existingModal.remove();
    }
    
    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('infrastructureModal'));
    modal.show();
    
    // Populate data after modal is shown
    document.getElementById('infrastructureModal').addEventListener('shown.bs.modal', function() {
        populateInfrastructureData(data);
    });
    
    // Cleanup when modal is closed
    document.getElementById('infrastructureModal').addEventListener('hidden.bs.modal', function() {
        if ($.fn.DataTable.isDataTable('#metricsTable')) {
            $('#metricsTable').DataTable().destroy();
        }
        if ($.fn.DataTable.isDataTable('#errorTable')) {
            $('#errorTable').DataTable().destroy();
        }
        const modalElement = document.getElementById('infrastructureModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.dispose();
        }
        modalElement.remove();
    });
}

// Function to populate infrastructure data
function populateInfrastructureData(data) {
    const { metrics, errorpayload } = data;
    
    // Update count based on modal title
    const modalTitle = document.getElementById('infrastructureModalLabel').textContent;
    if (metrics && metrics.length > 0) {
        if (modalTitle.includes('PCF')) {
            document.getElementById('pcfModelCount').textContent = metrics.length;
        } else if (modalTitle.includes('RunAI')) {
            document.getElementById('runaiModelCount').textContent = metrics.length;
        }
    }
    
    // Populate metrics table
    if (metrics && metrics.length > 0) {
        const columns = [
            { title: 'Use Case', data: 'usecasename' },
            { title: 'Contact', data: 'contact' },
            { 
                title: 'Health Status', 
                data: 'health',
                render: function(data) {
                    let badgeClass = 'bg-success';
                    if (data === 'Warning') badgeClass = 'bg-warning';
                    else if (data === 'Critical') badgeClass = 'bg-danger';
                    return `<span class="badge ${badgeClass}">${data}</span>`;
                }
            },
            { title: 'Requests', data: 'requests' },
            { title: 'Success', data: 'success' },
            { title: 'Failures', data: 'failure' },
            { 
                title: 'Error Rate %', 
                data: 'errorrate',
                render: function(data) {
                    const color = data > 10 ? 'text-danger' : data > 5 ? 'text-warning' : 'text-success';
                    return `<span class="${color}">${data}%</span>`;
                }
            },
            { title: 'Avg Response (ms)', data: 'insight_generate_avg' },
            { title: '90th Percentile (ms)', data: 'insight_generate_90th' },
            { 
                title: 'Flow Link', 
                data: 'flow',
                render: function(data) {
                    return `<a href="${data}" target="_blank" class="btn btn-sm btn-outline-primary">
                              <i class="fas fa-external-link-alt"></i> View
                            </a>`;
                }
            }
        ];
        
        $('#metricsTable').DataTable({
            data: metrics,
            columns: columns,
            responsive: true,
            pageLength: 10,
            dom: 'frtip',
            language: {
                search: "",
                searchPlaceholder: "Search metrics...",
            }
        });
    }
    
    // Populate error details table
    if (errorpayload && errorpayload.length > 0) {
        const errorColumns = [
            { title: 'Use Case', data: 'usecasename' },
            { 
                title: 'Error Message', 
                data: 'errormessage',
                render: function(data) {
                    // Truncate long error messages
                    return data.length > 40 ? 
                        `<span title="${data}">${data.substring(0, 40)}...</span>` : 
                        data;
                }
            },
            { 
                title: 'Count', 
                data: 'count',
                render: function(data) {
                    return `<span class="badge bg-secondary">${data}</span>`;
                }
            },
            { 
                title: 'Percentage', 
                data: 'percentage',
                render: function(data) {
                    const colorClass = data > 50 ? 'text-danger fw-bold' : 
                                     data > 25 ? 'text-warning fw-bold' : 'text-info';
                    return `<span class="${colorClass}">${data}%</span>`;
                }
            }
        ];
        
        $('#errorTable').DataTable({
            data: errorpayload,
            columns: errorColumns,
            responsive: true,
            pageLength: 10,
            dom: 'frtip',
            language: {
                search: "",
                searchPlaceholder: "Search errors...",
            },
            order: [[3, 'desc']] // Sort by percentage descending
        });
    } else {
        document.getElementById('errorTable').closest('.table-responsive').innerHTML = 
            '<div class="text-muted text-center p-3">No error data available</div>';
    }
}
