--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4
-- Dumped by pg_dump version 13.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: todolists; Type: TABLE; Schema: public; Owner: del
--

CREATE TABLE public.todolists (
    id integer NOT NULL,
    title text NOT NULL
);


ALTER TABLE public.todolists OWNER TO del;

--
-- Name: todolists_id_seq; Type: SEQUENCE; Schema: public; Owner: del
--

CREATE SEQUENCE public.todolists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.todolists_id_seq OWNER TO del;

--
-- Name: todolists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: del
--

ALTER SEQUENCE public.todolists_id_seq OWNED BY public.todolists.id;


--
-- Name: todos; Type: TABLE; Schema: public; Owner: del
--

CREATE TABLE public.todos (
    id integer NOT NULL,
    list_id integer NOT NULL,
    title text NOT NULL,
    done boolean DEFAULT false NOT NULL
);


ALTER TABLE public.todos OWNER TO del;

--
-- Name: todos_id_seq; Type: SEQUENCE; Schema: public; Owner: del
--

CREATE SEQUENCE public.todos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.todos_id_seq OWNER TO del;

--
-- Name: todos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: del
--

ALTER SEQUENCE public.todos_id_seq OWNED BY public.todos.id;


--
-- Name: todolists id; Type: DEFAULT; Schema: public; Owner: del
--

ALTER TABLE ONLY public.todolists ALTER COLUMN id SET DEFAULT nextval('public.todolists_id_seq'::regclass);


--
-- Name: todos id; Type: DEFAULT; Schema: public; Owner: del
--

ALTER TABLE ONLY public.todos ALTER COLUMN id SET DEFAULT nextval('public.todos_id_seq'::regclass);


--
-- Data for Name: todolists; Type: TABLE DATA; Schema: public; Owner: del
--

COPY public.todolists (id, title) FROM stdin;
1	Work Todos
2	Home Todos
3	Additional Todos
4	social todos
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: del
--

COPY public.todos (id, list_id, title, done) FROM stdin;
1	1	Get coffee	t
2	1	Chat with co-workers	t
3	1	Duck out of meeting	f
4	2	Feed the cats	t
5	2	Go to bed	t
6	2	Buy milk	t
7	2	Study for Launch School	t
8	4	Go to Libby's birthday party	f
\.


--
-- Name: todolists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: del
--

SELECT pg_catalog.setval('public.todolists_id_seq', 4, true);


--
-- Name: todos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: del
--

SELECT pg_catalog.setval('public.todos_id_seq', 8, true);


--
-- Name: todolists todolists_pkey; Type: CONSTRAINT; Schema: public; Owner: del
--

ALTER TABLE ONLY public.todolists
    ADD CONSTRAINT todolists_pkey PRIMARY KEY (id);


--
-- Name: todolists todolists_title_key; Type: CONSTRAINT; Schema: public; Owner: del
--

ALTER TABLE ONLY public.todolists
    ADD CONSTRAINT todolists_title_key UNIQUE (title);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: del
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- Name: todos todos_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: del
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.todolists(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

