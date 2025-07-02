--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

-- Started on 2024-09-10 18:00:58

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1007 (class 1247 OID 34747)
-- Name: college_cutoff_gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.college_cutoff_gender_enum AS ENUM (
    'Male',
    'Female',
    'Other'
);


ALTER TYPE public.college_cutoff_gender_enum OWNER TO postgres;

--
-- TOC entry 1010 (class 1247 OID 34754)
-- Name: college_cutoff_quota_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.college_cutoff_quota_enum AS ENUM (
    'OBC',
    'Genral',
    'sc',
    'ST',
    'PWD'
);


ALTER TYPE public.college_cutoff_quota_enum OWNER TO postgres;

--
-- TOC entry 1004 (class 1247 OID 34090)
-- Name: college_info_type_of_institute_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.college_info_type_of_institute_enum AS ENUM (
    'State Institute',
    'National',
    'Autonomous Institute',
    'Private Institute'
);


ALTER TYPE public.college_info_type_of_institute_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 33057)
-- Name: article; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    article_id integer NOT NULL,
    sub_title character varying,
    author_id integer NOT NULL,
    publication_date timestamp without time zone,
    read_time character varying,
    is_active boolean DEFAULT true,
    content character varying
);


ALTER TABLE public.article OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 33995)
-- Name: article_article_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.article_article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_article_id_seq OWNER TO postgres;

--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 269
-- Name: article_article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_article_id_seq OWNED BY public.article.article_id;


--
-- TOC entry 244 (class 1259 OID 33530)
-- Name: author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.author (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    view_name character varying,
    is_active boolean DEFAULT true NOT NULL,
    article_id integer,
    author_id integer NOT NULL,
    author_name character varying(100),
    about text,
    image character varying(100)
);


ALTER TABLE public.author OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 34008)
-- Name: author_author_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.author_author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.author_author_id_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 270
-- Name: author_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.author_author_id_seq OWNED BY public.author.author_id;


--
-- TOC entry 216 (class 1259 OID 32940)
-- Name: city; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.city (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    city_id integer NOT NULL,
    state_id integer NOT NULL,
    country_id integer NOT NULL,
    kapp_score numeric(3,2),
    slug character varying(100) NOT NULL,
    name character varying(300) NOT NULL
);


ALTER TABLE public.city OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 34018)
-- Name: city_city_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.city_city_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.city_city_id_seq OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 271
-- Name: city_city_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.city_city_id_seq OWNED BY public.city.city_id;


--
-- TOC entry 231 (class 1259 OID 33368)
-- Name: college_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_category (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    college_categories_id integer NOT NULL,
    title character varying(500),
    slug character varying(100) NOT NULL,
    kapp_score numeric(3,2)
);


ALTER TABLE public.college_category OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 33746)
-- Name: college_category_college_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_category_college_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_category_college_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 250
-- Name: college_category_college_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_category_college_categories_id_seq OWNED BY public.college_category.college_categories_id;


--
-- TOC entry 228 (class 1259 OID 33335)
-- Name: college_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_content (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    college_id integer,
    college_content_id integer NOT NULL,
    course_group_id integer,
    exam_id integer,
    author_id integer,
    seo_param json,
    title character varying(300) NOT NULL,
    description text,
    silos character varying(50)
);


ALTER TABLE public.college_content OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 33719)
-- Name: college_content_college_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_content_college_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_content_college_content_id_seq OWNER TO postgres;

--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 247
-- Name: college_content_college_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_content_college_content_id_seq OWNED BY public.college_content.college_content_id;


--
-- TOC entry 237 (class 1259 OID 33434)
-- Name: college_cutoff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_cutoff (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    college_id integer NOT NULL,
    colleges_course_id integer,
    college_cutoff_id integer NOT NULL,
    exam_id integer NOT NULL,
    category character varying(100),
    gender public.college_cutoff_gender_enum,
    "Quota" public.college_cutoff_quota_enum,
    cutoff_round integer
);


ALTER TABLE public.college_cutoff OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 33861)
-- Name: college_cutoff_college_cutoff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_cutoff_college_cutoff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_cutoff_college_cutoff_id_seq OWNER TO postgres;

--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 256
-- Name: college_cutoff_college_cutoff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_cutoff_college_cutoff_id_seq OWNED BY public.college_cutoff.college_cutoff_id;


--
-- TOC entry 236 (class 1259 OID 33424)
-- Name: college_dates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_dates (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event character varying,
    description character varying,
    college_id integer,
    college_dates_id integer NOT NULL,
    start_date character varying,
    end_date character varying
);


ALTER TABLE public.college_dates OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 33852)
-- Name: college_dates_college_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_dates_college_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_dates_college_dates_id_seq OWNER TO postgres;

--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 255
-- Name: college_dates_college_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_dates_college_dates_id_seq OWNED BY public.college_dates.college_dates_id;


--
-- TOC entry 260 (class 1259 OID 33890)
-- Name: college_exam; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_exam (
    college_exam_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    college_id integer,
    exam_id integer NOT NULL,
    college_course_id integer NOT NULL,
    title character varying(2000) NOT NULL,
    description character varying(500)
);


ALTER TABLE public.college_exam OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 33889)
-- Name: college_exam_college_exam_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_exam_college_exam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_exam_college_exam_id_seq OWNER TO postgres;

--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 259
-- Name: college_exam_college_exam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_exam_college_exam_id_seq OWNED BY public.college_exam.college_exam_id;


--
-- TOC entry 229 (class 1259 OID 33346)
-- Name: college_gallery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_gallery (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    college_gallery_id integer NOT NULL,
    college_id integer,
    "media_URL" character varying(500),
    tag character varying(100),
    alt_text character varying(100)
);


ALTER TABLE public.college_gallery OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 33728)
-- Name: college_gallery_college_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_gallery_college_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_gallery_college_gallery_id_seq OWNER TO postgres;

--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 248
-- Name: college_gallery_college_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_gallery_college_gallery_id_seq OWNED BY public.college_gallery.college_gallery_id;


--
-- TOC entry 235 (class 1259 OID 33414)
-- Name: college_hostel_campus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_hostel_campus (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    description character varying,
    college_id integer,
    college_hostelcampus_id integer NOT NULL
);


ALTER TABLE public.college_hostel_campus OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 33843)
-- Name: college_hostel_campus_college_hostelcampus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_hostel_campus_college_hostelcampus_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_hostel_campus_college_hostelcampus_id_seq OWNER TO postgres;

--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 254
-- Name: college_hostel_campus_college_hostelcampus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_hostel_campus_college_hostelcampus_id_seq OWNED BY public.college_hostel_campus.college_hostelcampus_id;


--
-- TOC entry 227 (class 1259 OID 33324)
-- Name: college_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_info (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    total_student integer,
    campus_size integer,
    "UGC_approved" boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    college_id integer NOT NULL,
    city_id integer,
    state_id integer,
    country_id integer,
    type_of_institute public.college_info_type_of_institute_enum,
    affiliated_university_id integer,
    parent_college_id integer,
    kapp_rating numeric(3,2),
    college_name character varying(700),
    short_name character varying(100),
    search_names character varying(700),
    location character varying(500),
    "PIN_code" character(6),
    latitude_longitude character varying(500),
    college_email character varying(500),
    college_phone character varying(100),
    college_website character varying(500),
    founded_year character(4),
    logo_img character varying(800),
    banner_img character varying(800),
    kapp_score numeric(3,2)
);


ALTER TABLE public.college_info OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 33707)
-- Name: college_info_college_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_info_college_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_info_college_id_seq OWNER TO postgres;

--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 246
-- Name: college_info_college_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_info_college_id_seq OWNED BY public.college_info.college_id;


--
-- TOC entry 238 (class 1259 OID 33444)
-- Name: college_ranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_ranking (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    rank integer,
    college_id integer,
    college_ranking_id integer NOT NULL,
    ranking_agency_id integer,
    stream_id integer,
    course_group_id integer,
    agency character varying(100),
    description character varying(500),
    year integer,
    rank_title character varying(100),
    rank_subtitle character varying(50)
);


ALTER TABLE public.college_ranking OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 33870)
-- Name: college_ranking_college_ranking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_ranking_college_ranking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_ranking_college_ranking_id_seq OWNER TO postgres;

--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 257
-- Name: college_ranking_college_ranking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_ranking_college_ranking_id_seq OWNED BY public.college_ranking.college_ranking_id;


--
-- TOC entry 234 (class 1259 OID 33404)
-- Name: college_scholarship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_scholarship (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    custom_id character varying NOT NULL,
    college_id integer NOT NULL,
    college_scholarship_id integer NOT NULL
);


ALTER TABLE public.college_scholarship OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 33834)
-- Name: college_scholarship_college_scholarship_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_scholarship_college_scholarship_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_scholarship_college_scholarship_id_seq OWNER TO postgres;

--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 253
-- Name: college_scholarship_college_scholarship_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_scholarship_college_scholarship_id_seq OWNED BY public.college_scholarship.college_scholarship_id;


--
-- TOC entry 230 (class 1259 OID 33357)
-- Name: college_video; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_video (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    college_video_id integer NOT NULL,
    college_id integer NOT NULL,
    "media_URL" character varying(500),
    tag character varying(100),
    alt_text character varying(500),
    "thumbnail_URL" character varying(500)
);


ALTER TABLE public.college_video OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 33737)
-- Name: college_video_college_video_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_video_college_video_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_video_college_video_id_seq OWNER TO postgres;

--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 249
-- Name: college_video_college_video_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_video_college_video_id_seq OWNED BY public.college_video.college_video_id;


--
-- TOC entry 245 (class 1259 OID 33541)
-- Name: college_wise_course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_wise_course (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_online boolean,
    is_integrated_course boolean,
    total_seats integer,
    is_active boolean DEFAULT true NOT NULL,
    college_id integer NOT NULL,
    college_wise_course_id integer NOT NULL,
    course_id integer,
    description character varying(500),
    eligibility character varying(500),
    name character varying(300),
    eligibility_description text,
    level character varying(300),
    course_format character varying(500),
    degree_type character varying(100),
    duration_type character varying(50),
    duration smallint,
    highlight text,
    admission_process text,
    overview text,
    syllabus text,
    course_brochure character varying(500),
    kapp_score numeric(3,2)
);


ALTER TABLE public.college_wise_course OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 33814)
-- Name: college_wise_course_college_wise_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_wise_course_college_wise_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_wise_course_college_wise_course_id_seq OWNER TO postgres;

--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 251
-- Name: college_wise_course_college_wise_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_wise_course_college_wise_course_id_seq OWNED BY public.college_wise_course.college_wise_course_id;


--
-- TOC entry 232 (class 1259 OID 33381)
-- Name: college_wise_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_wise_fees (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean,
    total_min_fees integer,
    total_max_fees integer,
    tution_fees_min_amount integer,
    tution_fees_max_amount integer,
    collegewise_fees_id integer NOT NULL,
    "collegewise_Course_id" integer,
    college_id integer,
    tution_fees_description text,
    other_fees json,
    year smallint,
    quota character varying(50),
    kapp_score numeric(3,2)
);


ALTER TABLE public.college_wise_fees OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 33825)
-- Name: college_wise_fees_collegewise_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_wise_fees_collegewise_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_wise_fees_collegewise_fees_id_seq OWNER TO postgres;

--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 252
-- Name: college_wise_fees_collegewise_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_wise_fees_collegewise_fees_id_seq OWNED BY public.college_wise_fees.collegewise_fees_id;


--
-- TOC entry 233 (class 1259 OID 33392)
-- Name: college_wise_placement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.college_wise_placement (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    year integer,
    highest_package integer,
    avg_package integer,
    median_package integer,
    top_recruiters character varying,
    placement_percentage integer,
    college_id integer,
    collegewise_placement_id integer NOT NULL,
    description text
);


ALTER TABLE public.college_wise_placement OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 34099)
-- Name: college_wise_placement_collegewise_placement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.college_wise_placement_collegewise_placement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.college_wise_placement_collegewise_placement_id_seq OWNER TO postgres;

--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 275
-- Name: college_wise_placement_collegewise_placement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.college_wise_placement_collegewise_placement_id_seq OWNED BY public.college_wise_placement.collegewise_placement_id;


--
-- TOC entry 217 (class 1259 OID 32948)
-- Name: country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country (
    name character varying NOT NULL,
    custom_id character varying NOT NULL,
    slug character varying,
    meta_desc character varying,
    og_img character varying,
    og_title character varying,
    priority_rank integer NOT NULL,
    priority_bool boolean NOT NULL,
    last_edited_by character varying,
    "IsPublished" boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    country_id integer NOT NULL
);


ALTER TABLE public.country OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 34070)
-- Name: country_country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.country_country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.country_country_id_seq OWNER TO postgres;

--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 273
-- Name: country_country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.country_country_id_seq OWNED BY public.country.country_id;


--
-- TOC entry 240 (class 1259 OID 33467)
-- Name: course_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_group (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    type character varying,
    stream_id integer,
    course_id integer,
    course_group_id integer NOT NULL,
    kapp_score numeric(3,2),
    slug character varying(100),
    name character varying(400) NOT NULL,
    full_name character varying(500),
    duration_in_months smallint
);


ALTER TABLE public.course_group OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 33936)
-- Name: course_group_course_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_group_course_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_group_course_group_id_seq OWNER TO postgres;

--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 263
-- Name: course_group_course_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_group_course_group_id_seq OWNED BY public.course_group.course_group_id;


--
-- TOC entry 225 (class 1259 OID 33259)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_edited_by character varying,
    is_online boolean,
    description text,
    is_active boolean,
    is_approved boolean,
    online_only boolean,
    kap_score numeric,
    degree_type character varying,
    is_integrated_course boolean DEFAULT false,
    eligibility character varying,
    level character varying,
    course_id integer NOT NULL,
    specialization_id integer NOT NULL,
    key_article integer,
    slug character varying(100) NOT NULL,
    course_name character varying(500) NOT NULL,
    short_name character varying(400),
    duration integer,
    last_update character varying(100),
    course_code integer,
    course_format character varying(500)
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 33925)
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_course_id_seq OWNER TO postgres;

--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 262
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- TOC entry 224 (class 1259 OID 33190)
-- Name: exam; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    exam_name character varying NOT NULL,
    last_edited_by character varying,
    exam_duration integer,
    exam_subject character varying,
    exam_description text,
    mode_of_exam character varying,
    level_of_exam character varying,
    slug character varying,
    meta_desc text,
    "Application_process" text,
    exam_fee_min numeric(10,2),
    exam_fee_max numeric(10,2),
    exam_shortname character varying,
    application_link character varying,
    last_update date,
    eligibilty_criteria character varying,
    eligibilty_description text,
    exam_method character varying,
    application_mode character varying,
    "IsPublished" boolean DEFAULT true,
    key_article character varying,
    is_active character varying DEFAULT true,
    kapp_score numeric(3,2),
    exam_info text,
    conducting_authority character varying,
    exam_id integer NOT NULL
);


ALTER TABLE public.exam OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 33507)
-- Name: exam_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_content (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    exam_info character varying,
    exam_eligibility character varying,
    exam_result character varying,
    exam_imp_highlight character varying,
    application_process character varying,
    syllabus character varying,
    exam_pattern character varying,
    cutoff character varying,
    fees_structure character varying,
    application_mode character varying,
    eligibility_criteria character varying,
    result character varying,
    admit_card character varying,
    auther_id character varying,
    is_active boolean DEFAULT true NOT NULL,
    exam_id integer NOT NULL,
    exam_content_id integer NOT NULL
);


ALTER TABLE public.exam_content OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 33976)
-- Name: exam_content_exam_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_content_exam_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_content_exam_content_id_seq OWNER TO postgres;

--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 267
-- Name: exam_content_exam_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_content_exam_content_id_seq OWNED BY public.exam_content.exam_content_id;


--
-- TOC entry 243 (class 1259 OID 33518)
-- Name: exam_date; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_date (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    exam_date character varying,
    start_date character varying,
    end_date character varying,
    is_active boolean DEFAULT true,
    tentative boolean,
    exam_id integer NOT NULL,
    exam_date_id integer NOT NULL,
    "event_Title" character varying(500),
    slug character varying(100),
    exam_year smallint
);


ALTER TABLE public.exam_date OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 33985)
-- Name: exam_date_exam_date_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_date_exam_date_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_date_exam_date_id_seq OWNER TO postgres;

--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 268
-- Name: exam_date_exam_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_date_exam_date_id_seq OWNED BY public.exam_date.exam_date_id;


--
-- TOC entry 266 (class 1259 OID 33966)
-- Name: exam_exam_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_exam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_exam_id_seq OWNER TO postgres;

--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 266
-- Name: exam_exam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_exam_id_seq OWNED BY public.exam.exam_id;


--
-- TOC entry 219 (class 1259 OID 32984)
-- Name: facilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facilities (
    name character varying NOT NULL,
    slug character varying,
    meta_desc character varying,
    og_img character varying,
    og_title character varying,
    priority_rank integer,
    priority_bool boolean,
    last_edited_by character varying,
    card_img_url character varying,
    img_arr text[],
    "IsPublished" boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.facilities OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 34080)
-- Name: facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facilities_id_seq OWNER TO postgres;

--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 274
-- Name: facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facilities_id_seq OWNED BY public.facilities.id;


--
-- TOC entry 220 (class 1259 OID 33000)
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    faculty_name character varying NOT NULL,
    degree character varying,
    department character varying,
    faculty_id integer NOT NULL,
    college_id integer,
    specialization integer,
    experience_years integer
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 33956)
-- Name: faculties_faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculties_faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculties_faculty_id_seq OWNER TO postgres;

--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 265
-- Name: faculties_faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculties_faculty_id_seq OWNED BY public.faculties.faculty_id;


--
-- TOC entry 239 (class 1259 OID 33454)
-- Name: ranking_agency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ranking_agency (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    custom_id character varying NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    description character varying,
    logo character varying,
    website character varying,
    contact_email character varying,
    ranking_agency_id integer NOT NULL
);


ALTER TABLE public.ranking_agency OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 33879)
-- Name: ranking_agency_ranking_agency_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ranking_agency_ranking_agency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ranking_agency_ranking_agency_id_seq OWNER TO postgres;

--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 258
-- Name: ranking_agency_ranking_agency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ranking_agency_ranking_agency_id_seq OWNED BY public.ranking_agency.ranking_agency_id;


--
-- TOC entry 241 (class 1259 OID 33478)
-- Name: specialization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialization (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    full_name character varying,
    is_active boolean,
    stream_id integer NOT NULL,
    specialization_id integer NOT NULL,
    "streamStreamId" integer,
    kapp_score numeric(3,2),
    name character varying(500) NOT NULL
);


ALTER TABLE public.specialization OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 33946)
-- Name: specialization_specialization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialization_specialization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specialization_specialization_id_seq OWNER TO postgres;

--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 264
-- Name: specialization_specialization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specialization_specialization_id_seq OWNED BY public.specialization.specialization_id;


--
-- TOC entry 218 (class 1259 OID 32956)
-- Name: state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.state (
    custom_id character varying NOT NULL,
    priority_rank integer NOT NULL,
    "IsPublished" boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    state_id integer NOT NULL,
    country_id integer NOT NULL,
    slug character varying(100) NOT NULL,
    meta_desc character varying(400),
    og_img character varying(100),
    og_title character varying(100),
    priority_bool integer NOT NULL,
    last_edited_by character varying(50),
    name character varying(300) NOT NULL
);


ALTER TABLE public.state OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 34028)
-- Name: state_state_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.state_state_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.state_state_id_seq OWNER TO postgres;

--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 272
-- Name: state_state_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.state_state_id_seq OWNED BY public.state.state_id;


--
-- TOC entry 222 (class 1259 OID 33020)
-- Name: stream; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stream (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true,
    is_online boolean DEFAULT false,
    stream_id integer NOT NULL,
    kapp_score numeric(3,2),
    slug character varying(100),
    stream_name character varying(300)
);


ALTER TABLE public.stream OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 33911)
-- Name: stream_stream_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stream_stream_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stream_stream_id_seq OWNER TO postgres;

--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 261
-- Name: stream_stream_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stream_stream_id_seq OWNED BY public.stream.stream_id;


--
-- TOC entry 221 (class 1259 OID 33010)
-- Name: tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    custom_id character varying NOT NULL,
    meta_desc character varying,
    og_img character varying,
    og_title character varying,
    priority_rank integer NOT NULL,
    priority_bool boolean NOT NULL,
    card_img_url character varying,
    type_of_tag character varying,
    "IsPublished" boolean NOT NULL,
    nav_promoted boolean NOT NULL,
    key_article character varying,
    slug character varying(100),
    tags_id integer NOT NULL,
    name character varying(300) NOT NULL,
    content text,
    stream integer
);


ALTER TABLE public.tag OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 34885)
-- Name: tag_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tag_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tag_tags_id_seq OWNER TO postgres;

--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 276
-- Name: tag_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tag_tags_id_seq OWNED BY public.tag.tags_id;


--
-- TOC entry 226 (class 1259 OID 33306)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    custom_id character varying NOT NULL,
    kapp_uuid1 SERIAL NOT NULL,
    email character varying,
    username character varying,
    first_name character varying NOT NULL,
    last_name character varying,
    priority character varying,
    company character varying,
    designation character varying,
    date_of_birth date,
    tenth_board character varying,
    tenth_percentage numeric,
    tenth_pass_year integer,
    twelth_board character varying,
    twelth_percentage numeric,
    twelth_pass_year integer,
    student_city character varying,
    student_state character varying,
    interest_incourse character varying,
    year_intake integer,
    insti_name character varying,
    insti_city character varying,
    insti_designation character varying,
    insti_purpose character varying,
    user_team character varying,
    mobile character varying,
    role character varying,
    password character varying NOT NULL,
    otp_verified boolean DEFAULT false NOT NULL,
    otp character varying
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 4882 (class 2604 OID 33996)
-- Name: article article_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article ALTER COLUMN article_id SET DEFAULT nextval('public.article_article_id_seq'::regclass);


--
-- TOC entry 4960 (class 2604 OID 34009)
-- Name: author author_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author ALTER COLUMN author_id SET DEFAULT nextval('public.author_author_id_seq'::regclass);


--
-- TOC entry 4859 (class 2604 OID 34019)
-- Name: city city_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city ALTER COLUMN city_id SET DEFAULT nextval('public.city_city_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 33747)
-- Name: college_category college_categories_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_category ALTER COLUMN college_categories_id SET DEFAULT nextval('public.college_category_college_categories_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 33720)
-- Name: college_content college_content_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_content ALTER COLUMN college_content_id SET DEFAULT nextval('public.college_content_college_content_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 33862)
-- Name: college_cutoff college_cutoff_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_cutoff ALTER COLUMN college_cutoff_id SET DEFAULT nextval('public.college_cutoff_college_cutoff_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 33853)
-- Name: college_dates college_dates_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_dates ALTER COLUMN college_dates_id SET DEFAULT nextval('public.college_dates_college_dates_id_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 33893)
-- Name: college_exam college_exam_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_exam ALTER COLUMN college_exam_id SET DEFAULT nextval('public.college_exam_college_exam_id_seq'::regclass);


--
-- TOC entry 4909 (class 2604 OID 33729)
-- Name: college_gallery college_gallery_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_gallery ALTER COLUMN college_gallery_id SET DEFAULT nextval('public.college_gallery_college_gallery_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 33844)
-- Name: college_hostel_campus college_hostelcampus_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_hostel_campus ALTER COLUMN college_hostelcampus_id SET DEFAULT nextval('public.college_hostel_campus_college_hostelcampus_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 33717)
-- Name: college_info college_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_info ALTER COLUMN college_id SET DEFAULT nextval('public.college_info_college_id_seq'::regclass);


--
-- TOC entry 4938 (class 2604 OID 33871)
-- Name: college_ranking college_ranking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_ranking ALTER COLUMN college_ranking_id SET DEFAULT nextval('public.college_ranking_college_ranking_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 33835)
-- Name: college_scholarship college_scholarship_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_scholarship ALTER COLUMN college_scholarship_id SET DEFAULT nextval('public.college_scholarship_college_scholarship_id_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 33738)
-- Name: college_video college_video_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_video ALTER COLUMN college_video_id SET DEFAULT nextval('public.college_video_college_video_id_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 33815)
-- Name: college_wise_course college_wise_course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_course ALTER COLUMN college_wise_course_id SET DEFAULT nextval('public.college_wise_course_college_wise_course_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 33826)
-- Name: college_wise_fees collegewise_fees_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_fees ALTER COLUMN collegewise_fees_id SET DEFAULT nextval('public.college_wise_fees_collegewise_fees_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 34100)
-- Name: college_wise_placement collegewise_placement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_placement ALTER COLUMN collegewise_placement_id SET DEFAULT nextval('public.college_wise_placement_collegewise_placement_id_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 34071)
-- Name: country country_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country ALTER COLUMN country_id SET DEFAULT nextval('public.country_country_id_seq'::regclass);


--
-- TOC entry 4945 (class 2604 OID 33937)
-- Name: course_group course_group_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_group ALTER COLUMN course_group_id SET DEFAULT nextval('public.course_group_course_group_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 33926)
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 33967)
-- Name: exam exam_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam ALTER COLUMN exam_id SET DEFAULT nextval('public.exam_exam_id_seq'::regclass);


--
-- TOC entry 4952 (class 2604 OID 33977)
-- Name: exam_content exam_content_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_content ALTER COLUMN exam_content_id SET DEFAULT nextval('public.exam_content_exam_content_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 33986)
-- Name: exam_date exam_date_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_date ALTER COLUMN exam_date_id SET DEFAULT nextval('public.exam_date_exam_date_id_seq'::regclass);


--
-- TOC entry 4868 (class 2604 OID 34081)
-- Name: facilities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities ALTER COLUMN id SET DEFAULT nextval('public.facilities_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 33957)
-- Name: faculties faculty_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties ALTER COLUMN faculty_id SET DEFAULT nextval('public.faculties_faculty_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 33880)
-- Name: ranking_agency ranking_agency_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_agency ALTER COLUMN ranking_agency_id SET DEFAULT nextval('public.ranking_agency_ranking_agency_id_seq'::regclass);


--
-- TOC entry 4948 (class 2604 OID 33947)
-- Name: specialization specialization_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialization ALTER COLUMN specialization_id SET DEFAULT nextval('public.specialization_specialization_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 34029)
-- Name: state state_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state ALTER COLUMN state_id SET DEFAULT nextval('public.state_state_id_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 33912)
-- Name: stream stream_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream ALTER COLUMN stream_id SET DEFAULT nextval('public.stream_stream_id_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 34886)
-- Name: tag tags_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag ALTER COLUMN tags_id SET DEFAULT nextval('public.tag_tags_id_seq'::regclass);


--
-- TOC entry 4985 (class 2606 OID 34894)
-- Name: tag PK_0ba977b53a9a1b1be395c55f8af; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT "PK_0ba977b53a9a1b1be395c55f8af" PRIMARY KEY (tags_id);


--
-- TOC entry 5043 (class 2606 OID 33954)
-- Name: specialization PK_146d60e71e37d090bb3b9919aa1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialization
    ADD CONSTRAINT "PK_146d60e71e37d090bb3b9919aa1" PRIMARY KEY (specialization_id);


--
-- TOC entry 5033 (class 2606 OID 33869)
-- Name: college_cutoff PK_1e6aae5c860ea4d7519ddc620a4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_cutoff
    ADD CONSTRAINT "PK_1e6aae5c860ea4d7519ddc620a4" PRIMARY KEY (college_cutoff_id);


--
-- TOC entry 5025 (class 2606 OID 34108)
-- Name: college_wise_placement PK_1eabfed9e8254cd9069e6e9a415; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_placement
    ADD CONSTRAINT "PK_1eabfed9e8254cd9069e6e9a415" PRIMARY KEY (collegewise_placement_id);


--
-- TOC entry 5015 (class 2606 OID 33745)
-- Name: college_video PK_1f50bf3698cf377e8aefbbc2b54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_video
    ADD CONSTRAINT "PK_1f50bf3698cf377e8aefbbc2b54" PRIMARY KEY (college_video_id);


--
-- TOC entry 4973 (class 2606 OID 34078)
-- Name: country PK_220fe368500f103cf873b01f159; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT "PK_220fe368500f103cf873b01f159" PRIMARY KEY (country_id);


--
-- TOC entry 5053 (class 2606 OID 33822)
-- Name: college_wise_course PK_25d9464c17faa7f9c6a28c8434d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_course
    ADD CONSTRAINT "PK_25d9464c17faa7f9c6a28c8434d" PRIMARY KEY (college_wise_course_id);


--
-- TOC entry 4979 (class 2606 OID 34088)
-- Name: facilities PK_2e6c685b2e1195e6d6394a22bc7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT "PK_2e6c685b2e1195e6d6394a22bc7" PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 33833)
-- Name: college_wise_fees PK_3339b8c721a3f7deda5fc92edba; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_fees
    ADD CONSTRAINT "PK_3339b8c721a3f7deda5fc92edba" PRIMARY KEY (collegewise_fees_id);


--
-- TOC entry 5013 (class 2606 OID 33736)
-- Name: college_gallery PK_3dc9a99302e17d37bdc59ade416; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_gallery
    ADD CONSTRAINT "PK_3dc9a99302e17d37bdc59ade416" PRIMARY KEY (college_gallery_id);


--
-- TOC entry 4999 (class 2606 OID 33934)
-- Name: courses PK_42dc69837b2e7bc603686ddaf53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_42dc69837b2e7bc603686ddaf53" PRIMARY KEY (course_id);


--
-- TOC entry 5047 (class 2606 OID 33993)
-- Name: exam_date PK_51ed0653b7e0259c9d46899c4f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_date
    ADD CONSTRAINT "PK_51ed0653b7e0259c9d46899c4f0" PRIMARY KEY (exam_date_id);


--
-- TOC entry 5003 (class 2606 OID 33322)
-- Name: user PK_7a9032316fbdfa01f227f28c55d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_7a9032316fbdfa01f227f28c55d" PRIMARY KEY (kapp_uuid1);


--
-- TOC entry 5055 (class 2606 OID 33899)
-- Name: college_exam PK_819a9f4dc9a0c660ea478439b45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_exam
    ADD CONSTRAINT "PK_819a9f4dc9a0c660ea478439b45" PRIMARY KEY (college_exam_id);


--
-- TOC entry 5045 (class 2606 OID 33984)
-- Name: exam_content PK_822b803f9e3ed327f9675bf2dde; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_content
    ADD CONSTRAINT "PK_822b803f9e3ed327f9675bf2dde" PRIMARY KEY (exam_content_id);


--
-- TOC entry 4993 (class 2606 OID 34005)
-- Name: article PK_962ab3ae47140b8d85c11cb84ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article
    ADD CONSTRAINT "PK_962ab3ae47140b8d85c11cb84ab" PRIMARY KEY (article_id);


--
-- TOC entry 5031 (class 2606 OID 33860)
-- Name: college_dates PK_96b75a7c1214f0e05bfd090a2b6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_dates
    ADD CONSTRAINT "PK_96b75a7c1214f0e05bfd090a2b6" PRIMARY KEY (college_dates_id);


--
-- TOC entry 4997 (class 2606 OID 33974)
-- Name: exam PK_9c1235b8acf443cd1e9982eb112; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT "PK_9c1235b8acf443cd1e9982eb112" PRIMARY KEY (exam_id);


--
-- TOC entry 5037 (class 2606 OID 33887)
-- Name: ranking_agency PK_a6414bd96e1311329e6fcf53011; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking_agency
    ADD CONSTRAINT "PK_a6414bd96e1311329e6fcf53011" PRIMARY KEY (ranking_agency_id);


--
-- TOC entry 5029 (class 2606 OID 33851)
-- Name: college_hostel_campus PK_ad866be49db2eb0350993497957; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_hostel_campus
    ADD CONSTRAINT "PK_ad866be49db2eb0350993497957" PRIMARY KEY (college_hostelcampus_id);


--
-- TOC entry 4983 (class 2606 OID 33964)
-- Name: faculties PK_b48e9fa6c1f06c850bd7b4a1975; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT "PK_b48e9fa6c1f06c850bd7b4a1975" PRIMARY KEY (faculty_id);


--
-- TOC entry 4969 (class 2606 OID 34026)
-- Name: city PK_bae511dd6a3e9d5a22331fc0fa9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT "PK_bae511dd6a3e9d5a22331fc0fa9" PRIMARY KEY (city_id);


--
-- TOC entry 5051 (class 2606 OID 34016)
-- Name: author PK_c36fb987d8132c9bdb15916e619; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT "PK_c36fb987d8132c9bdb15916e619" PRIMARY KEY (author_id);


--
-- TOC entry 4975 (class 2606 OID 34036)
-- Name: state PK_c6c635621335b860a10c0763e78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state
    ADD CONSTRAINT "PK_c6c635621335b860a10c0763e78" PRIMARY KEY (state_id);


--
-- TOC entry 5011 (class 2606 OID 33727)
-- Name: college_content PK_c7a9949a4baebbebc1ed2a23f90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_content
    ADD CONSTRAINT "PK_c7a9949a4baebbebc1ed2a23f90" PRIMARY KEY (college_content_id);


--
-- TOC entry 5039 (class 2606 OID 33944)
-- Name: course_group PK_d4452d95e7258a64374b898375e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_group
    ADD CONSTRAINT "PK_d4452d95e7258a64374b898375e" PRIMARY KEY (course_group_id);


--
-- TOC entry 5035 (class 2606 OID 33878)
-- Name: college_ranking PK_d72eec63b1e0cc96ff47d2c84fb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_ranking
    ADD CONSTRAINT "PK_d72eec63b1e0cc96ff47d2c84fb" PRIMARY KEY (college_ranking_id);


--
-- TOC entry 5017 (class 2606 OID 33755)
-- Name: college_category PK_de0736d2e44b43bae0ee3c3c3f2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_category
    ADD CONSTRAINT "PK_de0736d2e44b43bae0ee3c3c3f2" PRIMARY KEY (college_categories_id);


--
-- TOC entry 5009 (class 2606 OID 33715)
-- Name: college_info PK_e732b759fdb324f64465e0f422e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_info
    ADD CONSTRAINT "PK_e732b759fdb324f64465e0f422e" PRIMARY KEY (college_id);


--
-- TOC entry 5027 (class 2606 OID 33842)
-- Name: college_scholarship PK_f25d1d2eea6e60de2cc113cc0b5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_scholarship
    ADD CONSTRAINT "PK_f25d1d2eea6e60de2cc113cc0b5" PRIMARY KEY (college_scholarship_id);


--
-- TOC entry 4995 (class 2606 OID 33079)
-- Name: article UQ_0ab85f4be07b22d79906671d72f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article
    ADD CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE (slug);


--
-- TOC entry 4971 (class 2606 OID 34876)
-- Name: city UQ_12c33d73f8702451fe40e4387ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT "UQ_12c33d73f8702451fe40e4387ef" UNIQUE (slug);


--
-- TOC entry 4987 (class 2606 OID 34884)
-- Name: tag UQ_3413aed3ecde54f832c4f44f045; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT "UQ_3413aed3ecde54f832c4f44f045" UNIQUE (slug);


--
-- TOC entry 4981 (class 2606 OID 34865)
-- Name: facilities UQ_65946dd4d8662fc04318959da9f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT "UQ_65946dd4d8662fc04318959da9f" UNIQUE (slug);


--
-- TOC entry 4977 (class 2606 OID 34880)
-- Name: state UQ_67cfe181c5e7fc1c4fadd57084c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state
    ADD CONSTRAINT "UQ_67cfe181c5e7fc1c4fadd57084c" UNIQUE (slug);


--
-- TOC entry 5005 (class 2606 OID 33320)
-- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- TOC entry 5049 (class 2606 OID 34899)
-- Name: exam_date UQ_79053ab9d80577f97a4a96859df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_date
    ADD CONSTRAINT "UQ_79053ab9d80577f97a4a96859df" UNIQUE (slug);


--
-- TOC entry 4989 (class 2606 OID 34882)
-- Name: stream UQ_852fafc0d95aa628ca7c96122e8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream
    ADD CONSTRAINT "UQ_852fafc0d95aa628ca7c96122e8" UNIQUE (slug);


--
-- TOC entry 5019 (class 2606 OID 34833)
-- Name: college_category UQ_88dfebe6dab820430551f221c91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_category
    ADD CONSTRAINT "UQ_88dfebe6dab820430551f221c91" UNIQUE (slug);


--
-- TOC entry 5001 (class 2606 OID 34870)
-- Name: courses UQ_a3bb2d01cfa0f95bc5e034e1b7a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "UQ_a3bb2d01cfa0f95bc5e034e1b7a" UNIQUE (slug);


--
-- TOC entry 5021 (class 2606 OID 34831)
-- Name: college_category UQ_bda2eecee798cd5aa74d184951c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_category
    ADD CONSTRAINT "UQ_bda2eecee798cd5aa74d184951c" UNIQUE (title);


--
-- TOC entry 5007 (class 2606 OID 33318)
-- Name: user UQ_d1300aa4184f58ff73b1a9a205f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_d1300aa4184f58ff73b1a9a205f" UNIQUE (custom_id);


--
-- TOC entry 5041 (class 2606 OID 34897)
-- Name: course_group UQ_ec779f63d4b03a87962b0bde215; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_group
    ADD CONSTRAINT "UQ_ec779f63d4b03a87962b0bde215" UNIQUE (slug);


--
-- TOC entry 4991 (class 2606 OID 33914)
-- Name: stream stream_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream
    ADD CONSTRAINT stream_pkey PRIMARY KEY (stream_id);


--
-- TOC entry 5056 (class 2606 OID 34785)
-- Name: city FK_08af2eeb576770524fa05e26f39; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT "FK_08af2eeb576770524fa05e26f39" FOREIGN KEY (country_id) REFERENCES public.country(country_id) ON DELETE SET NULL;


--
-- TOC entry 5062 (class 2606 OID 34701)
-- Name: college_info FK_0c4fb57aa773136afdb0d441596; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_info
    ADD CONSTRAINT "FK_0c4fb57aa773136afdb0d441596" FOREIGN KEY (city_id) REFERENCES public.city(city_id) ON DELETE SET NULL;


--
-- TOC entry 5082 (class 2606 OID 34849)
-- Name: college_wise_course FK_0f17878ace12ceb8042b79c3874; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_course
    ADD CONSTRAINT "FK_0f17878ace12ceb8042b79c3874" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5060 (class 2606 OID 35085)
-- Name: article FK_16d4ce4c84bd9b8562c6f396262; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article
    ADD CONSTRAINT "FK_16d4ce4c84bd9b8562c6f396262" FOREIGN KEY (author_id) REFERENCES public.author(author_id) ON DELETE SET NULL;


--
-- TOC entry 5061 (class 2606 OID 34825)
-- Name: courses FK_26bcf0b4249de4f1f6fe662cb18; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "FK_26bcf0b4249de4f1f6fe662cb18" FOREIGN KEY (specialization_id) REFERENCES public.specialization(specialization_id) ON DELETE SET NULL;


--
-- TOC entry 5076 (class 2606 OID 34805)
-- Name: college_ranking FK_308a56e0768f2b18eea98e76258; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_ranking
    ADD CONSTRAINT "FK_308a56e0768f2b18eea98e76258" FOREIGN KEY (stream_id) REFERENCES public.stream(stream_id) ON DELETE SET NULL;


--
-- TOC entry 5057 (class 2606 OID 34780)
-- Name: city FK_37ecd8addf395545dcb0242a593; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT "FK_37ecd8addf395545dcb0242a593" FOREIGN KEY (state_id) REFERENCES public.state(state_id) ON DELETE SET NULL;


--
-- TOC entry 5065 (class 2606 OID 34206)
-- Name: college_content FK_3815cd56a929a4b19502b86021f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_content
    ADD CONSTRAINT "FK_3815cd56a929a4b19502b86021f" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5078 (class 2606 OID 34800)
-- Name: course_group FK_3ac3088e17cf7a63ffb205421e4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_group
    ADD CONSTRAINT "FK_3ac3088e17cf7a63ffb205421e4" FOREIGN KEY (stream_id) REFERENCES public.stream(stream_id) ON DELETE SET NULL;


--
-- TOC entry 5063 (class 2606 OID 34711)
-- Name: college_info FK_3d62aad6982cef882d0fb0732e6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_info
    ADD CONSTRAINT "FK_3d62aad6982cef882d0fb0732e6" FOREIGN KEY (country_id) REFERENCES public.country(country_id) ON DELETE SET NULL;


--
-- TOC entry 5077 (class 2606 OID 34651)
-- Name: college_ranking FK_4291ed9c04c211be0d1a086da97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_ranking
    ADD CONSTRAINT "FK_4291ed9c04c211be0d1a086da97" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5069 (class 2606 OID 34226)
-- Name: college_wise_fees FK_6a76481ddab8f10d9b56b506536; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_fees
    ADD CONSTRAINT "FK_6a76481ddab8f10d9b56b506536" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5079 (class 2606 OID 34790)
-- Name: specialization FK_6f60ea55fa7b0d42192c66061d6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialization
    ADD CONSTRAINT "FK_6f60ea55fa7b0d42192c66061d6" FOREIGN KEY ("streamStreamId") REFERENCES public.stream(stream_id);


--
-- TOC entry 5068 (class 2606 OID 34844)
-- Name: college_video FK_8b45876c57441530348190da5ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_video
    ADD CONSTRAINT "FK_8b45876c57441530348190da5ec" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5084 (class 2606 OID 34656)
-- Name: college_exam FK_90c601a9572e41c7c68585d0aa5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_exam
    ADD CONSTRAINT "FK_90c601a9572e41c7c68585d0aa5" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5071 (class 2606 OID 34839)
-- Name: college_scholarship FK_9b23acebafe25631e8469ba62a2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_scholarship
    ADD CONSTRAINT "FK_9b23acebafe25631e8469ba62a2" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5064 (class 2606 OID 34706)
-- Name: college_info FK_a01227cdec11dd98bf26a59eea3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_info
    ADD CONSTRAINT "FK_a01227cdec11dd98bf26a59eea3" FOREIGN KEY (state_id) REFERENCES public.state(state_id) ON DELETE SET NULL;


--
-- TOC entry 5074 (class 2606 OID 34834)
-- Name: college_cutoff FK_a0c286e0fd9a6fbf08554ef9182; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_cutoff
    ADD CONSTRAINT "FK_a0c286e0fd9a6fbf08554ef9182" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5066 (class 2606 OID 34696)
-- Name: college_content FK_a2732d3e99af74dad2dcd844c3a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_content
    ADD CONSTRAINT "FK_a2732d3e99af74dad2dcd844c3a" FOREIGN KEY (exam_id) REFERENCES public.exam(exam_id) ON DELETE SET NULL;


--
-- TOC entry 5072 (class 2606 OID 34551)
-- Name: college_hostel_campus FK_b2849b314f292c60863baf0cc11; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_hostel_campus
    ADD CONSTRAINT "FK_b2849b314f292c60863baf0cc11" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5070 (class 2606 OID 34541)
-- Name: college_wise_placement FK_b75c0a1a9db2c3ef72537e24a90; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_placement
    ADD CONSTRAINT "FK_b75c0a1a9db2c3ef72537e24a90" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5073 (class 2606 OID 34641)
-- Name: college_dates FK_bc978be66392b87458331ad183d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_dates
    ADD CONSTRAINT "FK_bc978be66392b87458331ad183d" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5059 (class 2606 OID 34661)
-- Name: faculties FK_bcb46696ad97add803cd53c8557; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT "FK_bcb46696ad97add803cd53c8557" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5083 (class 2606 OID 34770)
-- Name: college_wise_course FK_c01059bc5b04df7994847a51c46; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_wise_course
    ADD CONSTRAINT "FK_c01059bc5b04df7994847a51c46" FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE SET NULL;


--
-- TOC entry 5080 (class 2606 OID 34721)
-- Name: exam_content FK_c6654fff45a595bfe10fd00846e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_content
    ADD CONSTRAINT "FK_c6654fff45a595bfe10fd00846e" FOREIGN KEY (exam_id) REFERENCES public.exam(exam_id) ON DELETE SET NULL;


--
-- TOC entry 5067 (class 2606 OID 34216)
-- Name: college_gallery FK_c897179ca5b3efbd4413f71b6c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_gallery
    ADD CONSTRAINT "FK_c897179ca5b3efbd4413f71b6c2" FOREIGN KEY (college_id) REFERENCES public.college_info(college_id) ON DELETE SET NULL;


--
-- TOC entry 5058 (class 2606 OID 34775)
-- Name: state FK_dd19065b0813dbffd8170ea6753; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.state
    ADD CONSTRAINT "FK_dd19065b0813dbffd8170ea6753" FOREIGN KEY (country_id) REFERENCES public.country(country_id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 34741)
-- Name: college_cutoff FK_e841e1d9f48515c3b50f634304a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.college_cutoff
    ADD CONSTRAINT "FK_e841e1d9f48515c3b50f634304a" FOREIGN KEY (exam_id) REFERENCES public.exam(exam_id) ON DELETE SET NULL;


--
-- TOC entry 5081 (class 2606 OID 34731)
-- Name: exam_date FK_fc70026886caba34b5325f31dba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_date
    ADD CONSTRAINT "FK_fc70026886caba34b5325f31dba" FOREIGN KEY (exam_id) REFERENCES public.exam(exam_id) ON DELETE SET NULL;


-- Completed on 2024-09-10 18:00:59

--
-- PostgreSQL database dump complete
--

