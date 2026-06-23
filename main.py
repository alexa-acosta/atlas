def main():
    print("=== Atlas Job Scam Detector ===")
    print("1. Analyze Recruiter Email")
    print("2. Analyze Job Posting")
    print("3. Analyze Offer Letter")
    print("4. View History")
    print("5. Exit")
    
    choice = input("\nSelect an option (1-5): ")

    if choice == '1':
        path = input("Enter path to email file: ")
        print(f"Analyzing email from {path}...")
    elif choice == '2':
        path = input("Enter URL or file path for job post: ")
        print(f"Analyzing job post: {path}...")
    elif choice == '3':
        path = input("Enter path to offer letter: ")
        print(f"Analyzing offer letter: {path}...")
    elif choice == '4':
        print("Displaying history...")
    elif choice == '5':
        print("Goodbye!")
        return
    else:
        print("Invalid choice.")


if __name__ == "__main__":
    main()