import csv
import datetime
import os

def validate_and_clean_data(input_file_path, output_file_path):
    """
    Validate the time series data and create a valid output file.
    
    - Skip rows with non-numeric values, empty values, invalid dates format, or duplicates timestamps
    - Return statistics about different types of issues found
    """
    seen_timestamps = set()
    valid_rows = []
    
    stats = {
        'total_rows': 0,
        'non_numeric_values': 0,
        'invalid_date_format': 0,
        'duplicate_timestamps': 0,
        'valid_rows': 0
    }
    
    try:
        with open(input_file_path, 'r') as file:
            reader = csv.reader(file)
            
            try:
                header = next(reader)
                valid_rows.append(['timestamp', 'value'])

            except StopIteration:
                valid_rows.append(['timestamp', 'value'])
            
            for row in reader:
                stats['total_rows'] += 1
                is_valid = True
                
                if len(row) < 2:
                    continue

                timestamp_str, value_str = row[0], row[1]

                if timestamp_str in seen_timestamps:
                    stats['duplicate_timestamps'] += 1
                    is_valid = False

                if value_str is None or value_str.strip() == '' or value_str == 'NaN':
                    stats['non_numeric_values'] += 1
                    is_valid = False
                else:
                    try:
                        float(value_str)
                    except ValueError:
                        stats['non_numeric_values'] += 1
                        is_valid = False
        
                try:
                    timestamp = datetime.datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    stats['invalid_date_format'] += 1
                    is_valid = False
                
                if is_valid:
                    seen_timestamps.add(timestamp_str)
                    valid_rows.append([timestamp_str, value_str])
                    stats['valid_rows'] += 1
        
        os.makedirs(os.path.dirname(os.path.abspath(output_file_path)), exist_ok=True)
        with open(output_file_path, 'w', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(valid_rows)
        
        print(f"Data validation complete - found {stats['valid_rows']} valid rows out of {stats['total_rows']}")
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")
    
    return stats


input_file = "time_series.csv"
clean_file = "valid_time_series.csv"

print("Validating and cleaning data")
stats = validate_and_clean_data(input_file, clean_file)
print(f"Data validation statistics:")
print(f"- Total rows processed: {stats['total_rows']}")
print(f"- Valid rows: {stats['valid_rows']}")
print(f"- Rows with non-numeric/empty values: {stats['non_numeric_values']}")
print(f"- Rows with invalid date format: {stats['invalid_date_format']}")
print(f"- Rows with duplicate timestamps: {stats['duplicate_timestamps']}")
