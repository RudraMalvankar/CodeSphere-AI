# a) Exception Handling
try:
    num = int("abc")
except ValueError as e:
    print("ValueError caught:", e)
finally:
    print("Finally block executed.")

# b) All types of Inheritance already shared above
# Single Inheritance
class A:
    def show(self):
        print("This is class A (Single Inheritance)")

class B(A):
    def show_b(self):
        print("This is class B (Single Inheritance)")

# Multiple Inheritance
class C:
    def show_c(self):
        print("This is class C (Multiple Inheritance)")

class D(A, C):
    def show_d(self):
        print("This is class D (Multiple Inheritance)")

# Multilevel Inheritance
class E(B):
    def show_e(self):
        print("This is class E (Multilevel Inheritance)")

# Hierarchical Inheritance
class F(A):
    def show_f(self):
        print("This is class F (Hierarchical Inheritance)")

# Hybrid Inheritance
class G(D, E):
    def show_g(self):
        print("This is class G (Hybrid Inheritance)")

# Demonstration
print("=== Single Inheritance ===")
b = B()
b.show()
b.show_b()

print("\n=== Multiple Inheritance ===")
d = D()
d.show()
d.show_c()
d.show_d()

print("\n=== Multilevel Inheritance ===")
e = E()
e.show()
e.show_b()
e.show_e()

print("\n=== Hierarchical Inheritance ===")
f = F()
f.show()
f.show_f()

print("\n=== Hybrid Inheritance ===")
g = G()
g.show()
g.show_c()
g.show_b()
g.show_d()
g.show_e()
g.show_g()
