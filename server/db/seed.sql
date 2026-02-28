-- Additional Translation Keys for UI
INSERT IGNORE INTO translation_keys (key_name, module, default_text) VALUES
('nav_dashboard', 'ui', 'Dashboard'),
('nav_deliveries', 'ui', 'Deliveries'),
('nav_drivers', 'ui', 'Drivers'),
('stat_total_deliveries', 'dashboard', 'Total Deliveries'),
('stat_success_rate', 'dashboard', 'Success Rate'),
('stat_fraud_blocked', 'dashboard', 'Fraud Blocked'),
('stat_active_drivers', 'dashboard', 'Active Drivers'),
('btn_logout', 'ui', 'Logout'),
('search_placeholder', 'ui', 'Search deliveries, drivers...'),
('recent_proofs', 'dashboard', 'Recent Proofs');

-- Example Translations for Spanish (es)
INSERT IGNORE INTO translations (key_id, language_id, translated_text)
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Panel de Control' FROM translation_keys WHERE key_name = 'nav_dashboard' UNION ALL
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Entregas' FROM translation_keys WHERE key_name = 'nav_deliveries' UNION ALL
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Conductores' FROM translation_keys WHERE key_name = 'nav_drivers' UNION ALL
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Total de Entregas' FROM translation_keys WHERE key_name = 'stat_total_deliveries' UNION ALL
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Tasa de Éxito' FROM translation_keys WHERE key_name = 'stat_success_rate' UNION ALL
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Fraude Bloqueado' FROM translation_keys WHERE key_name = 'stat_fraud_blocked' UNION ALL
SELECT id, (SELECT id FROM languages WHERE code = 'es'), 'Conductores Activos' FROM translation_keys WHERE key_name = 'stat_active_drivers';

-- Mock Analytics Data for current business
-- Assuming business_id = 1 for the first registered user
INSERT IGNORE INTO delivery_analytics_daily (business_id, date, total_deliveries, successful_deliveries, failed_deliveries, fraud_prevention_savings)
VALUES 
(1, CURDATE(), 42, 40, 2, 150.00),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 38, 37, 1, 80.00),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 45, 43, 2, 210.00),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 30, 29, 1, 50.00),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 50, 48, 2, 300.00),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 35, 34, 1, 120.00),
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 40, 39, 1, 90.00);
