CREATE TABLE todolists (
	id serial PRIMARY KEY,
	title text UNIQUE NOT NULL
);

CREATE TABLE todos (
	id serial PRIMARY KEY,
	list_id integer NOT NULL REFERENCES todoLists(id) ON DELETE CASCADE,
	title text NOT NULL,
	done boolean NOT NULL DEFAULT false
);	
