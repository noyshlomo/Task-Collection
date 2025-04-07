from collections import Counter
import heapq

'''
Time complexity: 
    - reading file: O(file_size)
    - heap operations: O(M log N) where M is the number of unique errors in the file and N is the number od most common we want.
    
    overall time complexity is: O(file_size + M log N) = O(file_size) since N is small and M is small.

Space complexity:
    - buffer size: O(chunk_size) = O(10000) = O(1)
    - errors_counter: O(M) where M is the number of errors in the file.
    in the worst case where each error occurs exactly once, this would be O(file_size)
    - heap: O(N) where N is the number of most common errors we want.
    (in this case where N max value is 5, this would be O(5) = O(1))
    
    overall space complexity is: O(M)

'''
def process_file(file_path, chunk_size):
    errors_counter = Counter()

    with open(file_path, "r", encoding="utf-8") as f:
        buffer = []
        for line in f:
            buffer.append(line)
            if len(buffer) >= chunk_size:
                errors_counter.update(count_errors_in_buffer(buffer))
                buffer.clear()

        if buffer:
            errors_counter.update(count_errors_in_buffer(buffer))

    return errors_counter


def count_errors_in_buffer(lines):
    errors_counter = Counter()
    for line in lines:
        error = get_error(line)
        if error:
            errors_counter[error] += 1
    
    return errors_counter


def get_error(line):
    start_indx = line.find("Error: ")
    if start_indx != -1:
        return line[start_indx + len("Error: "):-2]
    return None

def most_common_errors(errors_counter, N):
    if N not in range(6):
        return "The maximum value for N is 5 and the minimum is 0. Please try again :)"
    
    heap = []
    for error, count in errors_counter.items():
        if len(heap) < N:
            heapq.heappush(heap, (count, error))
        elif count > heap[0][0]:
            heapq.heappushpop(heap, (count, error))
    
    result = [(error, count) for count, error in heap]
    result.sort(reverse=True, key=lambda x: x[1])
    
    return result


log_file = "logs.txt"
error_counts = process_file(log_file, chunk_size=10000)

print(most_common_errors(error_counts, 5))
            


