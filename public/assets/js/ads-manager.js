/* AdsManager — dynamic ad network form rendering */
const AdsManager = (() => {
    const NETWORKS = {
        admob: {
            label: 'AdMob',
            fields: [
                { key: 'app_id', label: 'App ID', placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy' },
                { key: 'banner_id', label: 'Banner ID' },
                { key: 'interstitial_id', label: 'Interstitial ID' },
                { key: 'rewarded_id', label: 'Rewarded ID' },
                { key: 'native_id', label: 'Native ID' },
            ],
        },
        applovin: {
            label: 'AppLovin',
            fields: [
                { key: 'sdk_key', label: 'SDK Key' },
                { key: 'banner_zone_id', label: 'Banner Zone ID' },
                { key: 'interstitial_zone_id', label: 'Interstitial Zone ID' },
                { key: 'rewarded_zone_id', label: 'Rewarded Zone ID' },
            ],
        },
        startapp: {
            label: 'StartApp',
            fields: [
                { key: 'app_id', label: 'App ID' },
                { key: 'return_ad', label: 'Return Ad', type: 'select', options: { yes: 'Yes', no: 'No' } },
                {
                    key: 'interstitial_type', label: 'Interstitial Type', type: 'select',
                    options: { overlay: 'Overlay', video: 'Video', both: 'Both' },
                },
            ],
        },
        unity: {
            label: 'Unity Ads',
            fields: [
                { key: 'game_id', label: 'Game ID' },
                { key: 'banner_placement', label: 'Banner Placement' },
                { key: 'interstitial_placement', label: 'Interstitial Placement' },
                { key: 'rewarded_placement', label: 'Rewarded Placement' },
                { key: 'test_mode', label: 'Test Mode', type: 'select', options: { '1': 'Enabled', '0': 'Disabled' } },
            ],
        },
    };

    function render(network, containerId, existing = {}) {
        const cfg = NETWORKS[network];
        const box = document.getElementById(containerId);
        if (!cfg || !box) return;
        box.innerHTML = cfg.fields.map((f) => {
            const val = existing[f.key] !== undefined ? existing[f.key] : '';
            let input;
            if (f.type === 'select') {
                input = `<select name="fields[${f.key}]" class="form-control">` +
                    Object.entries(f.options).map(([v, l]) =>
                        `<option value="${v}" ${String(val) === v ? 'selected' : ''}>${l}</option>`).join('') +
                    '</select>';
            } else {
                input = `<input type="text" name="fields[${f.key}]" class="form-control" placeholder="${f.placeholder || ''}" value="${String(val).replace(/"/g, '&quot;')}">`;
            }
            return `<div class="form-group fadeIn"><label class="form-label">${f.label}</label>${input}</div>`;
        }).join('');
    }

    return { NETWORKS, render };
})();
