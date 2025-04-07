-- task 2
UPDATE People p1
SET "Spouse_Id" = p2."Person_Id"
FROM People p2
WHERE p1."Spouse_Id" IS NULL
  AND p2."Spouse_Id" = p1."Person_Id"
  AND p1."Person_Id" != p2."Person_Id";