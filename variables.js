
// Encore des variables globales

var whensFull= [ 
    "respawn_player", 
    "scratch_fail", 
    "card_extraction", 
    "network_disconnected", 
    "parental_code", 
    "respawn_scan", 
    "collecte_fail", 
    "notifiers_failed", 
    "signal_quality", 
    "updater_success", 
    "zap", 
    "card_valid_primo", 
    "pdsChanged", 
    "eureka_fail", 
    "key_stop", 
    "recordDeleted", 
    "playing_stopped", 
    "primo", 
    "playing_content", 
    "hlsError", 
    "external_loaded", 
    "maintenance_partial_begin", 
    "hlsUnderflow", 
    "broadcasted_version", 
    "storage_removed", 
    "unscanned_channel", 
    "aboprofile_fail", 
    "unauthorized_channel", 
    "card_init_primo", 
    "updater_failed", 
    "maintenance_begin", 
    "parental_code_success", 
    "wake_up", 
    "vod_consume_fail", 
    "maintenance_end", 
    "stand_by", 
    "external_query", 
    "key_pause", 
    "bad_signal_quality", 
    "external_load", 
    "respawn_downloader", 
    "maintenance_partial_end", 
    "pdl_download_fail", 
    "hlsProfile", 
    "key_play", 
    "hlsPlay"
];

var networks = [ "eth0", "ra0" ];
var pds = ["HLS", "DVB"]
var webapps = [ 
    "1.9.55", 
    "1.9.40", 
    "1.9.50", 
    "1.9.67", 
    "1.9.53", 
    "1.9.45", 
    "1.9.61", 
    "1.9.231", 
    "1.9.63", 
    "1.10.2", 
    "1.10.1", 
    "1.8.32", 
    "1.9.68", 
    "1.9.60", 
    "1.9.61-1"
];
var mws = [ 
    "1.5.5.33", 
    "1.5.1.11", 
    "1.5.15.9", 
    "1.5.5.16", 
    "1.5.7.14", 
    "1.5.5.24", 
    "1.5.1.62", 
    "1.4.6.24", 
    "1.5.7.36", 
    "1.5.7.49"
];

var historyWhens = [
    "bad_signal_quality",
    "broadcasted_version",
    "dvb_table_update",
    "hlsError",
    "hlsProfile",
    "network_disconnected",
    // "pdl_download_failed",
    "scratch_fail",
    "storage_removed",
    "system_update_cancel",
    "zap"
]

var stateVariables,
    names,
    whens;

// if(refresh && refresh.connect == "logs")
// {
//     stateVariables = {
//         network: networks,
//         pds: pds,
//         webapp: webapps,
//         mw: mws
//     };
//     whens = whensFull;
//     names = networks.concat(mws).concat(pds).concat(webapps).concat(whens);
// } else {
    stateVariables = {};
    whens = historyWhens;
    names = historyWhens;
// }

// on pourra les grouper en variables réelles et logiques : fait

var n = names.length; // dimension du problème