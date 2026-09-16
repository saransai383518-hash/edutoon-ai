import java.util.Scanner;
public class Main {
    public static void main(String[] args){
        Sacnner sc=new Scanner(System.in);
        int bankbalance;
        Scanner sc=sc.nextInt(System.in);
        int amount;
        Scanner sc=sc.nextInt(System.in);

        try{
            if (amount<=bankbalance){
                System.out.println("Amount withdraw");
            }
            catch (Exception e){
                System.out.println("Insufficient balance");
        }
    }
}