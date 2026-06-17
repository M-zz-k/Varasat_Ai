'use strict';

// Generates simple, rural-friendly next steps based on the graph data.
// Avoids legal language and uses plain instructions.
function generateLegalGuidance(graphData) {
    if (!graphData || !graphData.nodes) return null;

    const assets = graphData.nodes.filter(n => n.type === 'asset');
    const persons = graphData.nodes.filter(n => n.type === 'person');
    const hasAssets = assets.length > 0;

    let steps = [];
    let requiredDocs = ['✓ Identity proof', '✓ Family relationship proof (e.g. Ration Card)'];
    let authority = 'Local revenue office / Village Panchayat';

    if (hasAssets) {
        // Look at asset types to determine authority
        const assetTypes = assets.map(a => (a.data?.type || '').toLowerCase());
        
        if (assetTypes.some(t => t.includes('land') || t.includes('property') || t.includes('khasra'))) {
            requiredDocs.push('✓ Previous ownership records (e.g. Khatauni/7/12 extract)');
            authority = 'Local Tehsil / Revenue Office';
            steps.push({
                title: 'Collect required documents',
                description: 'Gather your family ID and the old land papers discovered.'
            });
            steps.push({
                title: 'Verify information',
                description: 'Take these papers to the local Patwari or revenue officer to confirm they match official records.'
            });
            steps.push({
                title: 'Complete process',
                description: 'Submit these documents to update the property record in your name. Do not pay middlemen.'
            });
        } else if (assetTypes.some(t => t.includes('bank') || t.includes('insurance') || t.includes('fund'))) {
            requiredDocs.push('✓ Death certificate of account holder');
            requiredDocs.push('✓ Bank passbook or policy document');
            authority = 'Relevant Bank Branch or Insurance Office';
            steps.push({
                title: 'Collect required documents',
                description: 'Gather the death certificate and the old passbook/policy papers.'
            });
            steps.push({
                title: 'Verify information',
                description: 'Visit the bank branch and ask the manager to check the account status.'
            });
            steps.push({
                title: 'Complete process',
                description: 'Fill out a simple claim form provided by the bank to transfer the funds. Ensure you provide your own bank details for transfer.'
            });
        } else {
            // Generic
            requiredDocs.push('✓ Previous ownership records');
            steps.push({
                title: 'Collect required documents',
                description: 'Gather all old papers found.'
            });
            steps.push({
                title: 'Verify information',
                description: 'Check these papers with a trusted local official.'
            });
            steps.push({
                title: 'Complete process',
                description: 'Submit these documents to update the record in your name.'
            });
        }
    } else {
        steps.push({
            title: 'Collect basic documents',
            description: 'Gather family identity proofs.'
        });
        steps.push({
            title: 'Search further',
            description: 'Check old trunks or ask village elders for any papers.'
        });
    }

    return {
        authority,
        requiredDocs,
        steps,
        safetyDisclaimer: "VARASAT provides AI-assisted guidance based on available information. Please verify with official authorities. We do not give legal verdicts or claim ownership on your behalf."
    };
}

module.exports = { generateLegalGuidance };
