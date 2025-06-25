CREATE TABLE public.users (
    id bigint NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    email character varying NOT NULL,
    "lastActiveAt" timestamp without time zone DEFAULT '2025-06-18 13:02:33.619'::timestamp without time zone,
    password character varying NOT NULL,
    photo text,
    "phoneNumber" character varying NOT NULL,
    role public.users_role_enum DEFAULT 'USER'::public.users_role_enum NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "stripeCustomerId" character varying,
    status character varying DEFAULT 'ACTIVE'::character varying NOT NULL
);

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);

CREATE TABLE public.user_settings (
    id bigint NOT NULL,
    "userId" bigint NOT NULL,
    "Push_Notifications" jsonb DEFAULT '{"Chat_Messages": false, "Order_Status_Updates": true}'::jsonb NOT NULL,
    "Newsletter_Preferences" jsonb DEFAULT '{"Weekly_Newsletter": true}'::jsonb NOT NULL,
    notifications jsonb DEFAULT '{"Order_Updates": true, "Promotions_Deals": false, "New_Product_Arrivals": true}'::jsonb NOT NULL,
    "shipping_Address" jsonb DEFAULT '[{"city": "New York, NY 10001", "name": "Sarah Johnson", "label": "Home", "phone": "(555) 123-4567", "address": "123 Main Street, Apt 4B", "country": "United States", "isDefault": true}, {"city": "New York, NY 10002", "name": "Sarah Johnson", "label": "Office", "phone": "(555) 987-6543", "address": "456 Business Ave, Floor 12", "country": "United States", "isDefault": false}]'::jsonb NOT NULL
);

CREATE TABLE public."Category" (
    id bigint NOT NULL,
    category_name character varying NOT NULL,
    category_image jsonb NOT NULL,
    category_topic character varying,
    status character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "time" time without time zone DEFAULT ('now'::text)::time with time zone NOT NULL
);

CREATE TABLE public."Store" (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description text,
    logo character varying,
    address character varying NOT NULL,
    "phoneNumber" character varying NOT NULL,
    email character varying NOT NULL,
    tagline character varying DEFAULT 'Your one-stop beauty shop'::character varying,
    "storeType" character varying DEFAULT 'Online Store'::character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "businessHours" jsonb DEFAULT '{"friday": "9:00 AM - 8:00 PM", "monday": "9:00 AM - 6:00 PM", "sunday": "Closed", "tuesday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 7:00 PM", "thursday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM"}'::jsonb,
    "socialLinks" jsonb DEFAULT '{"tiktok": "https://tiktok.com/@michaelsbeauty", "facebook": "https://facebook.com/michaelsbeautystore", "instagram": "https://instagram.com/michaelsbeauty"}'::jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."Seller" (
    id bigint NOT NULL,
    "userId" bigint NOT NULL,
    "storeId" bigint,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."Product" (
    id bigint NOT NULL,
    product_name character varying NOT NULL,
    product_image character varying NOT NULL,
    product_status character varying NOT NULL,
    standard_price numeric(10,2) NOT NULL,
    offer_price numeric(10,2),
    product_description text NOT NULL,
    product_date date NOT NULL,
    product_quantity numeric(10,2) NOT NULL,
    "isFeatured" boolean DEFAULT true,
    "productGallery" jsonb DEFAULT '["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTixMUT-tvYkn-4K0khhYC3lKHV_mRmBGpc0g&s", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIod4kE9WxLPhpki-0oPMeumyS8DzwkFe3-g&s", "https://i.pinimg.com/236x/14/86/86/148686b4a830e06d8089db5cb1e521f4.jpg", "https://thumbs.dreamstime.com/b/pink-flowers-float-clear-waters-hawaii-soft-white-sand-below-347952870.jpg"]'::jsonb,
    store_id bigint NOT NULL
);

CREATE TABLE public."Cart" (
    id bigint NOT NULL,
    "userId" bigint,
    "CheckedUser" bigint,
    total numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL
);

CREATE TABLE public."CartItem" (
    id bigint NOT NULL,
    "cartId" bigint NOT NULL,
    "productId" bigint NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."Order" (
    id bigint NOT NULL,
    "orderNumber" character varying(255) NOT NULL,
    "orderStatus" character varying(255) NOT NULL,
    "orderDate" date NOT NULL,
    "cartId" bigint NOT NULL,
    "paymentInfo" character varying(255) NOT NULL,
    country character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    "streetAddress" character varying(255) NOT NULL,
    "userId" bigint NOT NULL,
    "phoneNumber" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "stripeSessionId" character varying(255)
);

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    "orderId" bigint NOT NULL,
    "userId" bigint NOT NULL,
    "sellerId" bigint NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public.invoices_status_enum DEFAULT 'PENDING'::public.invoices_status_enum NOT NULL,
    "paymentMethod" character varying NOT NULL,
    "paymentDate" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.comments (
    id bigint NOT NULL,
    content text NOT NULL,
    rating integer NOT NULL,
    "userId" bigint NOT NULL,
    "productId" bigint NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    files text
);

CREATE TABLE public.comment_replies (
    id bigint NOT NULL,
    content text NOT NULL,
    comment_id bigint NOT NULL,
    user_id bigint NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    files text
);

CREATE TABLE public.managers (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.chat_rooms (
    id integer NOT NULL,
    status character varying DEFAULT 'urgent'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.chat_room_participants_user (
    "chatRoomId" integer NOT NULL,
    "userId" bigint NOT NULL
);

CREATE TABLE public.messages (
    id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "contentType" character varying DEFAULT 'text'::character varying NOT NULL,
    files text,
    chat_room_id integer NOT NULL,
    sender_id bigint NOT NULL
);

CREATE TABLE public.product_categories (
    product_id bigint NOT NULL,
    category_id bigint NOT NULL
);

CREATE TABLE public.roles_users_users (
    "usersId" bigint NOT NULL,
    "rolesId" integer NOT NULL
);

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_0b7320e7be48e88e0f408e535d9" FOREIGN KEY ("sellerId") REFERENCES public."Seller"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.chat_room_participants_user
    ADD CONSTRAINT "FK_16f2408eb656d0b12245241dcb9" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.roles_users_users
    ADD CONSTRAINT "FK_391282056f6da8665b38480a131" FOREIGN KEY ("usersId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "FK_53f2aba8a21b914f306a990d296" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_5bb8108b85199f4ae096599917f" FOREIGN KEY (chat_room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.roles_users_users
    ADD CONSTRAINT "FK_6baa1fce24dde516186c4f0269a" FOREIGN KEY ("rolesId") REFERENCES public.roles(id);

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "FK_8748b4a0e8de6d266f2bbc877f6" FOREIGN KEY (product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.comment_replies
    ADD CONSTRAINT "FK_8aa833f092ae58677a01cf4cc78" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "FK_9148da8f26fc248e77a387e3112" FOREIGN KEY (category_id) REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "FK_9f8304787dd13d61bc94afd07b0" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_a58a78a0e0031dd93a2f56f1e8e" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.comment_replies
    ADD CONSTRAINT "FK_a79ad427702b6688514624a54f1" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "FK_c93d6f0ae7b8bcae9439e871ab1" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "FK_cdc25a0a42e8f451020a26680b3" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "FK_d26ee078939b94811462a0280d8" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "FK_d69b6a39ca6929148dad3e30bf4" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "FK_d7d49d061115538c5f4a726ae1d" FOREIGN KEY (store_id) REFERENCES public."Store"(id);

ALTER TABLE ONLY public."Seller"
    ADD CONSTRAINT "FK_f004b8837f2383b83e92cd9ffe5" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.managers
    ADD CONSTRAINT "FK_f041d245569d3b05305ec8dbead" FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public."Seller"
    ADD CONSTRAINT "FK_f5b32f51bc1391ebc2058580c60" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_fcbe490dc37a1abf68f19c5ccb9" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.chat_room_participants_user
    ADD CONSTRAINT "FK_fd0350d006a2fcb072030ae8a07" FOREIGN KEY ("chatRoomId") REFERENCES public.chat_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;
