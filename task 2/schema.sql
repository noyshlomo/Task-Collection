DROP VIEW IF EXISTS Family_Tree;
DROP TABLE IF EXISTS People;

CREATE TABLE People (
    "Person_Id" INT PRIMARY KEY,
    "Personal_Name" VARCHAR(100),
    "Family_Name" VARCHAR(100),
    "Gender" VARCHAR(10) CHECK ("Gender" IN ('Male', 'Female', 'Other')),
    "Father_Id" INT,
    "Mother_Id" INT,
    "Spouse_Id" INT,
    FOREIGN KEY ("Father_Id") REFERENCES People("Person_Id"),
    FOREIGN KEY ("Mother_Id") REFERENCES People("Person_Id"),
    FOREIGN KEY ("Spouse_Id") REFERENCES People("Person_Id")
);