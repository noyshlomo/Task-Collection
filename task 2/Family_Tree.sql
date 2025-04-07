-- task 1
CREATE VIEW Family_Tree AS
WITH Relationships AS (
    -- Fathers
    SELECT "Person_Id", "Father_Id" AS "Relative_Id", 'Father' AS "Connection_Type"
    FROM People
    WHERE "Father_Id" IS NOT NULL

    UNION ALL

    -- Mothers
    SELECT "Person_Id", "Mother_Id" AS "Relative_Id", 'Mother' AS "Connection_Type"
    FROM People
    WHERE "Mother_Id" IS NOT NULL

    UNION ALL

    -- Spouses
    SELECT "Person_Id", "Spouse_Id" AS "Relative_Id", 
           CASE WHEN "Gender" = 'Male' THEN 'Wife' 
                WHEN "Gender" = 'Female' THEN 'Husband' 
                ELSE 'Spouse' END AS "Connection_Type"
    FROM People
    WHERE "Spouse_Id" IS NOT NULL

    UNION ALL

    -- Children (from father's side)
    SELECT "Father_Id" AS "Person_Id", "Person_Id" AS "Relative_Id",
           CASE WHEN "Gender" = 'Male' THEN 'Son' ELSE 'Daughter' END AS "Connection_Type"
    FROM People
    WHERE "Father_Id" IS NOT NULL

    UNION ALL

    -- Children (from mother's side)
    SELECT "Mother_Id" AS "Person_Id", "Person_Id" AS "Relative_Id",
           CASE WHEN "Gender" = 'Male' THEN 'Son' ELSE 'Daughter' END AS "Connection_Type"
    FROM People
    WHERE "Mother_Id" IS NOT NULL

    UNION ALL

    -- Siblings (same father)
    SELECT p1."Person_Id", p2."Person_Id" AS "Relative_Id",
           CASE WHEN p2."Gender" = 'Male' THEN 'Brother' ELSE 'Sister' END AS "Connection_Type"
    FROM People p1
    JOIN People p2 ON p1."Father_Id" = p2."Father_Id" AND p1."Person_Id" != p2."Person_Id"
    WHERE p1."Father_Id" IS NOT NULL

    UNION ALL

    -- Siblings (same mother, different father)
    SELECT p1."Person_Id", p2."Person_Id" AS "Relative_Id",
           CASE WHEN p2."Gender" = 'Male' THEN 'Brother' ELSE 'Sister' END AS "Connection_Type"
    FROM People p1
    JOIN People p2 ON p1."Mother_Id" = p2."Mother_Id" AND p1."Father_Id" != p2."Father_Id" AND p1."Person_Id" != p2."Person_Id"
    WHERE p1."Mother_Id" IS NOT NULL
)
SELECT DISTINCT "Person_Id" AS "Person_Id", 
    "Relative_Id" AS "Relative_Id", 
    "Connection_Type" AS "Connection_type"
FROM Relationships
ORDER BY "Person_Id", "Connection_Type";