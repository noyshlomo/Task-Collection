import csv
import datetime
import os
from collections import defaultdict


def process_in_chunks(input_file, output_file):
    """
    Process time series data in daily chunks and compute overall hourly averages.
    """
    try:
        daily_data = defaultdict(list)
        
        with open(input_file, 'r') as file:
            reader = csv.reader(file)
            next(reader)
            
            for row in reader:
                if len(row) < 2:
                    continue
                    
                timestamp_str, value_str = row
                
                try:
                    timestamp = datetime.datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                    day_key = timestamp.strftime('%Y-%m-%d')
                    daily_data[day_key].append((timestamp_str, value_str))
                except ValueError:
                    continue
        
        all_hourly_values = defaultdict(list)
        
        for day_key, day_data in daily_data.items():
            day_hourly_values = defaultdict(list)
            
            for timestamp_str, value_str in day_data:
                try:
                    value = float(value_str)
                    timestamp = datetime.datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                    hour_key = timestamp.strftime('%H')
                    day_hourly_values[hour_key].append(value)
                except (ValueError, TypeError):
                    continue
            
            for hour, values in day_hourly_values.items():
                all_hourly_values[hour].extend(values)
        
        hourly_averages = {}
        for hour, values in all_hourly_values.items():
            if values:
                hourly_averages[hour] = sum(values) / len(values)
        
        write_hourly_averages(hourly_averages, output_file)
        print(f"Processed {len(daily_data)} days of data, results in {output_file}")
        
        return hourly_averages
    
    except Exception as e:
        print(f"Error processing in chunks: {str(e)}")
        return {}

def write_hourly_averages(hourly_averages, output_file):
    try:
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        with open(output_file, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['hour', 'average'])
            
            for hour, avg in sorted(hourly_averages.items()):
                writer.writerow([hour, avg])
        
        print(f"Hourly averages written to {output_file}")
        return True
    
    except Exception as e:
        print(f"Error writing hourly averages: {str(e)}")
        return False
    

clean_file = "valid_time_series.csv"
final_output = "chunk_hourly_averages.csv"

print("Processing data in chunks by day")
chunk_results = process_in_chunks(clean_file, final_output)