import csv
import datetime
import os
from collections import defaultdict

def compute_hourly_averages(file_path):
    hourly_values = defaultdict(list)
    
    try:
        with open(file_path, 'r') as file:
            reader = csv.reader(file)
            next(reader)
            
            for row in reader:
                if len(row) < 2:
                    continue
                    
                timestamp_str, value_str = row[0], row[1]
                
                try:
                    value = float(value_str)
                    timestamp = datetime.datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                    
                    hour_key = timestamp.strftime('%H')
                    hourly_values[hour_key].append(value)
                    
                except (ValueError, TypeError):
                    continue

        hourly_averages = {}
        for hour, values in hourly_values.items():
            if values:
                hourly_averages[hour] = sum(values) / len(values)
        
        return hourly_averages
    
    except Exception as e:
        print(f"Error computing hourly averages: {str(e)}")
        return {}

def write_hourly_averages(hourly_averages, output_path):
    """
    write hourly averages to output file.
    """
    try:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['hour', 'average'])
            
            for hour, avg in sorted(hourly_averages.items()):
                writer.writerow([hour, avg])
                
        print(f"Hourly averages written to {output_path}")
        return True
    
    except Exception as e:
        print(f"Error writing hourly averages: {str(e)}")
        return False


clean_file = "valid_time_series.csv"
hourly_averages_file = "hourly_averages.csv"
print("Computing hourly averages")
hourly_averages = compute_hourly_averages(clean_file)
write_hourly_averages(hourly_averages, hourly_averages_file)