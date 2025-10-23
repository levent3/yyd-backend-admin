--
-- PostgreSQL database dump
--

\restrict EaY5vm3v5DOtcZiB2wmm1LsJOs71stR282lnudoYaEBapGbTQ5oqgOOQae6PyTv

-- Dumped from database version 14.19
-- Dumped by pg_dump version 14.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: AdminModule; Type: TABLE DATA; Schema: public; Owner: myadmin
--

COPY public."AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId") FROM stdin;
1	Dashboard	dashboard	/admin/dashboard	home	1	\N
2	Kullanıcılar	users	/admin/users	users	2	\N
3	Roller	roles	/admin/roles	shield	3	\N
4	Projeler	projects	/admin/projects	briefcase	4	\N
6	Bağış Yönetimi	donations	\N	heart	5	\N
12	Bağış Kampanyaları	campaigns	/admin/campaigns	target	1	6
14	Düzenli Bağışlar	recurring-donations	/admin/recurring-donations	repeat	3	6
15	Ödeme İşlemleri	payment-transactions	/admin/payment-transactions	credit-card	4	6
16	Banka Hesapları	bank-accounts	/admin/bank-accounts	dollar-sign	5	6
17	Kampanya Ayarları	campaign-settings	/admin/campaign-settings	sliders	6	6
13	Tüm Bağışlar	donations-list	/admin/donations	list	2	6
18	Modül Yönetimi	modules	/admin/modules	layers	11	\N
19	Sistem Ayarları	settings	/admin/system-settings	settings	12	\N
7	Haber Yönetimi	news	/admin/news	file-text	6	\N
8	Galeri Yönetimi	gallery	/admin/gallery	image	7	\N
9	İletişim Mesajları	contact	/admin/contact	mail	8	\N
10	Gönüllü Başvuruları	volunteers	/admin/volunteers	user-check	9	\N
11	Kariyer Başvuruları	careers	/admin/careers	briefcase	10	\N
20	Sayfalar	pages	/admin/pages	file-text	13	\N
21	Tarihçe	timeline	/admin/timeline	calendar	14	\N
22	Ekip Üyeleri	team-members	/admin/team-members	users	15	\N
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: myadmin
--

COPY public."Role" (id, name) FROM stdin;
1	superadmin
2	editor
\.


--
-- Data for Name: RoleModulePermission; Type: TABLE DATA; Schema: public; Owner: myadmin
--

COPY public."RoleModulePermission" ("roleId", "moduleId", permissions) FROM stdin;
2	1	{"read": false, "create": false, "delete": false, "update": false}
2	3	{"read": true, "create": false, "delete": false, "update": false}
1	6	{"read": true, "create": true, "delete": true, "update": true}
1	7	{"read": true, "create": true, "delete": true, "update": true}
1	8	{"read": true, "create": true, "delete": true, "update": true}
1	9	{"read": true, "create": true, "delete": true, "update": true}
1	10	{"read": true, "create": true, "delete": true, "update": true}
1	11	{"read": true, "create": true, "delete": true, "update": true}
2	6	{"read": true, "create": false, "delete": false, "update": false}
1	18	{"read": true, "create": true, "delete": true, "update": true}
1	19	{"read": true, "create": true, "delete": true, "update": true}
2	4	{"read": false, "create": false, "delete": false, "update": false}
1	1	{"read": true, "create": false, "delete": false, "update": false}
1	20	{"read": true, "create": true, "delete": true, "update": true}
2	2	{"read": false, "create": false, "delete": false, "update": false}
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: myadmin
--

COPY public."User" (id, username, "passwordHash", email, "fullName", "createdAt", "updatedAt", "roleId") FROM stdin;
2	testadmin	$2b$12$D8TxpK/D4vhptYoJuyZGpehgpP2iy/nfqdLyJIB/Yo/vCBW572KMS	test@admin.com	Test Admin	2025-10-13 07:18:20.536	2025-10-13 07:18:20.536	2
3	testuser	$2b$12$Xfy4AJokNZ7p0PvLwy/ufOhlFyBxpuhVMNJNZRZJOFb4p0SBRilYG	test@example.com	Test User	2025-10-13 08:02:01.519	2025-10-13 08:02:01.519	2
5	admin	$2b$12$xd8k3239JE4VovPCeoNqtO48Oinz0NZPCGgUyfemd40jAZRjW4Q/.	admin@yyd.com	Super Admin	2025-10-13 10:57:23.888	2025-10-13 10:57:23.888	1
\.


--
-- Name: AdminModule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myadmin
--

SELECT pg_catalog.setval('public."AdminModule_id_seq"', 20, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myadmin
--

SELECT pg_catalog.setval('public."Role_id_seq"', 5, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: myadmin
--

SELECT pg_catalog.setval('public."User_id_seq"', 6, true);


--
-- PostgreSQL database dump complete
--

\unrestrict EaY5vm3v5DOtcZiB2wmm1LsJOs71stR282lnudoYaEBapGbTQ5oqgOOQae6PyTv

